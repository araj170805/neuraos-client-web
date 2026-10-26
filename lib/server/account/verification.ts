import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminBucket, adminDb } from "@/lib/firebase/admin";
import type {
  SubmitVerificationRequest,
  SubmitVerificationResponse,
  VerificationUploadUrlRequest,
  VerificationUploadUrlResponse,
} from "@/lib/contracts/verification";
import { MAX_VERIFICATION_DOC_BYTES } from "@/lib/limits";
import { ApiError } from "@/lib/server/http/errors";
import type { AuthUser } from "@/lib/server/http/route";
import type { UserDoc } from "@/lib/types";

/**
 * POST /api/verification/upload-url
 *
 * Returns a short-lived signed PUT URL for uploading verification documents
 * (registration certificate or ID proof) under `verification/{uid}/`.
 * Errors: BAD_FILE.
 */
export async function getVerificationUploadUrl(
  user: AuthUser,
  req: VerificationUploadUrlRequest,
): Promise<VerificationUploadUrlResponse> {
  if (req.sizeBytes > MAX_VERIFICATION_DOC_BYTES) {
    throw new ApiError("BAD_FILE", "Verification documents must be up to 10 MB.");
  }

  const bucket = adminBucket();
  const fileId = crypto.randomUUID();
  const safeName = req.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const objectPath = `verification/${user.uid}/${fileId}-${safeName}`;
  const file = bucket.file(objectPath);

  const expiresMinutes = 15;
  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

  const [uploadUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: expiresAt,
    contentType: req.mimeType,
  });

  return {
    uploadUrl,
    headers: {
      "Content-Type": req.mimeType,
    },
    expiresAt: expiresAt.toISOString(),
    gcsUri: `gs://${bucket.name}/${objectPath}`,
  };
}

/**
 * POST /api/verification
 *
 * Submits a new verification application or resubmits after `needs_info`.
 * Sets the application and `users.verification.status` to `pending`.
 * Errors: FORBIDDEN (already pending or approved), BAD_FILE (document not under caller's folder).
 */
export async function submitVerification(
  user: AuthUser,
  req: SubmitVerificationRequest,
): Promise<SubmitVerificationResponse> {
  const bucket = adminBucket();
  const userFolderPrefix = `gs://${bucket.name}/verification/${user.uid}/`;

  // Verify all documents are under the caller's folder: verification/{uid}/
  for (const doc of req.documents) {
    const isUnderFolder =
      doc.gcsUri.startsWith(userFolderPrefix) ||
      new RegExp(`^gs://[^/]+/verification/${user.uid}/.+`).test(doc.gcsUri);

    if (!isUnderFolder) {
      throw new ApiError(
        "BAD_FILE",
        "Verification documents must be uploaded under your verification folder.",
      );
    }
  }

  const db = adminDb();
  const userRef = db.doc(`users/${user.uid}`);

  let applicationId: string | undefined;

  await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists) {
      throw new ApiError("FORBIDDEN", "User not found. Please complete onboarding first.");
    }

    const userData = userSnap.data() as UserDoc;
    const currentStatus = userData.verification?.status ?? "none";

    if (currentStatus === "pending" || currentStatus === "approved") {
      throw new ApiError("FORBIDDEN", "Verification application is already pending or approved.");
    }

    // Reuse existing application ID on resubmission, otherwise create a new one.
    applicationId = userData.verification?.applicationId || db.collection("verificationApplications").doc().id;

    const now = FieldValue.serverTimestamp();
    const appRef = db.doc(`verificationApplications/${applicationId}`);

    tx.set(appRef, {
      uid: user.uid,
      fullName: req.fullName,
      phone: req.phone,
      specialty: req.specialty,
      institution: req.institution,
      registrationNumber: req.registrationNumber,
      councilName: req.councilName,
      registrationYear: req.registrationYear,
      documents: req.documents,
      status: "pending",
      reviewerUid: null,
      reviewNote: null,
      submittedAt: now,
      reviewedAt: null,
    });

    tx.update(userRef, {
      "verification.status": "pending",
      "verification.applicationId": applicationId,
      "verification.verifiedAt": null,
      lastActiveAt: now,
    });
  });

  return {
    applicationId: applicationId!,
    status: "pending",
  };
}
