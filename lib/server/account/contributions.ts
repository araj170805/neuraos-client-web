import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminBucket, adminDb } from "@/lib/firebase/admin";
import {
  ALLOWED_AUDIO_MIME,
  type AudioUploadUrlRequest,
  type AudioUploadUrlResponse,
  type CreateContributionRequest,
  type CreateContributionResponse,
  type SubmitContributionRequest,
  type SubmitContributionResponse,
  type TranscribeResponse,
  type UpdateContributionRequest,
} from "@/lib/contracts/contributions";
import {
  CONTRIBUTIONS_PER_DAY,
  MAX_VOICE_BYTES,
  MAX_VOICE_SECONDS,
} from "@/lib/limits";
import { checkPii, transcribeAudio } from "@/lib/server/ai/contributions";
import { ApiError } from "@/lib/server/http/errors";
import type { AuthUser } from "@/lib/server/http/route";
import type { ContributionDoc, UsageDoc, UserDoc } from "@/lib/types";

/** Formats today's date in Asia/Kolkata timezone as YYYYMMDD. */
export function getTodayKey(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parts.replace(/-/g, "");
}

/**
 * POST /api/contributions
 *
 * Creates a new draft contribution.
 * Requires `canContribute` on user doc and `contributionsEnabled` in `config/app`.
 * Errors: FORBIDDEN, FEATURE_OFF, DAILY_LIMIT.
 */
export async function createContribution(
  user: AuthUser,
  req: CreateContributionRequest,
): Promise<CreateContributionResponse> {
  const db = adminDb();

  // 1. Check feature flag in config/app
  const configSnap = await db.doc("config/app").get();
  if (configSnap.exists) {
    const config = configSnap.data();
    if (config?.contributionsEnabled === false) {
      throw new ApiError("FEATURE_OFF", "Contributions are switched off right now.");
    }
  }

  // 2. Check user's canContribute flag
  const userSnap = await db.doc(`users/${user.uid}`).get();
  if (!userSnap.exists) {
    throw new ApiError("FORBIDDEN", "User profile not found. Complete onboarding first.");
  }
  const userData = userSnap.data() as UserDoc;
  if (!userData.canContribute) {
    throw new ApiError("FORBIDDEN", "Only verified doctors can contribute.");
  }

  // 3. Check daily contribution limit
  const today = getTodayKey();
  const usageSnap = await db.doc(`usage/${user.uid}_${today}`).get();
  if (usageSnap.exists) {
    const usage = usageSnap.data() as UsageDoc;
    if ((usage.contributions ?? 0) >= CONTRIBUTIONS_PER_DAY) {
      throw new ApiError(
        "DAILY_LIMIT",
        "You have reached today's contribution limit. Try again tomorrow.",
      );
    }
  }

  // 4. Create draft contribution document
  const contributionRef = db.collection("contributions").doc();
  const now = FieldValue.serverTimestamp();

  await contributionRef.set({
    contributorUid: user.uid,
    specialty: req.specialty,
    title: req.title,
    type: req.type,
    text: req.text,
    audio: null,
    transcript: null,
    piiCheck: null,
    status: "draft",
    contributionTermsVersion: "",
    reviewerUid: null,
    reviewNote: null,
    createdAt: now,
    submittedAt: null,
    reviewedAt: null,
  });

  return { contributionId: contributionRef.id };
}

/**
 * PATCH /api/contributions/:id
 *
 * Updates a draft or needs_changes contribution (owner only).
 * Errors: NOT_FOUND, FORBIDDEN.
 */
export async function updateContribution(
  user: AuthUser,
  id: string,
  req: UpdateContributionRequest,
): Promise<{ ok: true }> {
  const db = adminDb();
  const docRef = db.doc(`contributions/${id}`);
  const snap = await docRef.get();

  if (!snap.exists) {
    throw new ApiError("NOT_FOUND", "Contribution not found.");
  }

  const doc = snap.data() as ContributionDoc;
  if (doc.contributorUid !== user.uid) {
    throw new ApiError("FORBIDDEN", "You can only edit your own contributions.");
  }

  if (doc.status !== "draft" && doc.status !== "needs_changes") {
    throw new ApiError(
      "FORBIDDEN",
      "Only drafts or contributions needing changes can be updated.",
    );
  }

  const updates: Record<string, string> = {};
  if (req.title !== undefined) updates.title = req.title;
  if (req.specialty !== undefined) updates.specialty = req.specialty;
  if (req.text !== undefined) updates.text = req.text;

  await docRef.update(updates);
  return { ok: true };
}

/**
 * POST /api/contributions/:id/audio-url
 *
 * Returns a signed PUT URL for uploading audio under `contributions/{uid}/`.
 * Errors: NOT_FOUND, FORBIDDEN, BAD_FILE.
 */
export async function getContributionAudioUploadUrl(
  user: AuthUser,
  id: string,
  req: AudioUploadUrlRequest,
): Promise<AudioUploadUrlResponse> {
  const db = adminDb();
  const docRef = db.doc(`contributions/${id}`);
  const snap = await docRef.get();

  if (!snap.exists) {
    throw new ApiError("NOT_FOUND", "Contribution not found.");
  }

  const doc = snap.data() as ContributionDoc;
  if (doc.contributorUid !== user.uid) {
    throw new ApiError("FORBIDDEN", "You can only upload audio for your own contributions.");
  }

  if (doc.status !== "draft" && doc.status !== "needs_changes") {
    throw new ApiError("FORBIDDEN", "Only drafts or contributions needing changes can be modified.");
  }

  if (doc.type !== "voice") {
    throw new ApiError("BAD_FILE", "Audio can only be uploaded to voice contributions.");
  }

  if (
    req.sizeBytes > MAX_VOICE_BYTES ||
    req.durationSec > MAX_VOICE_SECONDS ||
    !ALLOWED_AUDIO_MIME.includes(req.mimeType)
  ) {
    throw new ApiError("BAD_FILE", "Invalid audio file format, size or duration.");
  }

  const bucket = adminBucket();
  const fileExt = req.mimeType.split("/")[1]?.split(";")[0] ?? "webm";
  const objectPath = `contributions/${user.uid}/${id}-${crypto.randomUUID()}.${fileExt}`;
  const file = bucket.file(objectPath);

  const expiresMinutes = 15;
  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

  const [uploadUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: expiresAt,
    contentType: req.mimeType,
  });

  const gcsUri = `gs://${bucket.name}/${objectPath}`;

  await docRef.update({
    audio: {
      gcsUri,
      mimeType: req.mimeType,
      durationSec: req.durationSec,
    },
    transcript: null,
  });

  return {
    uploadUrl,
    headers: {
      "Content-Type": req.mimeType,
    },
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * POST /api/contributions/:id/transcribe
 *
 * Runs fast-model transcription on uploaded audio and sets `transcript.draftText`.
 * Errors: NOT_FOUND, FORBIDDEN, UPLOAD_MISSING.
 */
export async function transcribeContribution(
  user: AuthUser,
  id: string,
): Promise<TranscribeResponse> {
  const db = adminDb();
  const docRef = db.doc(`contributions/${id}`);
  const snap = await docRef.get();

  if (!snap.exists) {
    throw new ApiError("NOT_FOUND", "Contribution not found.");
  }

  const doc = snap.data() as ContributionDoc;
  if (doc.contributorUid !== user.uid) {
    throw new ApiError("FORBIDDEN", "You can only transcribe your own contributions.");
  }

  if (doc.status !== "draft" && doc.status !== "needs_changes") {
    throw new ApiError("FORBIDDEN", "Only drafts or contributions needing changes can be transcribed.");
  }

  if (!doc.audio?.gcsUri) {
    throw new ApiError("UPLOAD_MISSING", "Upload audio first before transcribing.");
  }

  try {
    const { transcript } = await transcribeAudio(doc.audio);
    await docRef.update({
      transcript: { status: "ready", draftText: transcript },
      text: transcript,
    });
    return { status: "ready", draftText: transcript };
  } catch {
    await docRef.update({
      transcript: { status: "failed", draftText: null },
    });
    return { status: "failed", draftText: null };
  }
}

/**
 * POST /api/contributions/:id/submit
 *
 * Runs the fast-model PII check and submits the contribution.
 * If flags exist and `confirmFlagged` is false, returns flags without submitting.
 * Errors: NOT_FOUND, FORBIDDEN, DAILY_LIMIT, INVALID_REQUEST.
 */
export async function submitContribution(
  user: AuthUser,
  id: string,
  req: SubmitContributionRequest,
): Promise<SubmitContributionResponse> {
  const db = adminDb();
  const docRef = db.doc(`contributions/${id}`);
  const snap = await docRef.get();

  if (!snap.exists) {
    throw new ApiError("NOT_FOUND", "Contribution not found.");
  }

  const doc = snap.data() as ContributionDoc;
  if (doc.contributorUid !== user.uid) {
    throw new ApiError("FORBIDDEN", "You can only submit your own contributions.");
  }

  if (doc.status !== "draft" && doc.status !== "needs_changes") {
    throw new ApiError(
      "FORBIDDEN",
      "Only drafts or contributions needing changes can be submitted.",
    );
  }

  if (!doc.text || doc.text.trim().length === 0) {
    throw new ApiError("INVALID_REQUEST", "Contribution text cannot be empty.");
  }

  const today = getTodayKey();
  const usageRef = db.doc(`usage/${user.uid}_${today}`);

  // Run PII check using fast model
  const piiResult = await checkPii(doc.text);

  // If flagged and user hasn't explicitly confirmed, do not submit yet
  if (piiResult.status === "flagged" && !req.confirmFlagged) {
    await docRef.update({
      piiCheck: { status: "flagged", flags: piiResult.flags },
    });
    return {
      submitted: false,
      piiCheck: { status: "flagged", flags: piiResult.flags },
    };
  }

  // Submit in transaction: check daily limit and increment usage
  await db.runTransaction(async (tx) => {
    const usageSnap = await tx.get(usageRef);
    const count = usageSnap.exists ? ((usageSnap.data() as UsageDoc).contributions ?? 0) : 0;

    if (count >= CONTRIBUTIONS_PER_DAY) {
      throw new ApiError(
        "DAILY_LIMIT",
        "You have reached today's contribution limit. Try again tomorrow.",
      );
    }

    const now = FieldValue.serverTimestamp();

    tx.set(
      usageRef,
      {
        contributions: FieldValue.increment(1),
        aiReplies: FieldValue.increment(0),
        minuteCount: FieldValue.increment(0),
        minuteWindowStart: now,
      },
      { merge: true },
    );

    tx.update(docRef, {
      status: "submitted",
      submittedAt: now,
      piiCheck: { status: piiResult.status, flags: piiResult.flags },
      contributionTermsVersion: req.contributionTermsVersion,
    });

    tx.update(db.doc(`users/${user.uid}`), {
      "consent.contributionTermsVersion": req.contributionTermsVersion,
      lastActiveAt: now,
    });
  });

  return {
    submitted: true,
    piiCheck: { status: piiResult.status, flags: piiResult.flags },
  };
}
