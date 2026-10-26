import "server-only";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type {
  AdminApplication,
  AdminAuditLog,
  AdminContribution,
  AdminUser,
  AppConfig,
  ApplicationDecisionRequest,
  ApplicationDecisionResponse,
  ContributionDecisionRequest,
  ContributionDecisionResponse,
  ListApplicationsQuery,
  ListApplicationsResponse,
  ListAuditLogsQuery,
  ListAuditLogsResponse,
  ListContributionsQuery,
  ListContributionsResponse,
  ListUsersQuery,
  ListUsersResponse,
  UpdateConfigRequest,
  UpdateConfigResponse,
} from "@/lib/contracts/admin";
import { DEFAULT_DAILY_SPEND_CAP_USD } from "@/lib/limits";
import { ApiError } from "@/lib/server/http/errors";
import type { AuthUser } from "@/lib/server/http/route";
import type {
  AuditLogDoc,
  ContributionDoc,
  UserDoc,
  VerificationApplicationDoc,
} from "@/lib/types";

function toIso(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (typeof (val as Timestamp).toDate === "function") {
    return (val as Timestamp).toDate().toISOString();
  }
  if (typeof val === "string") return val;
  return new Date().toISOString();
}

function toIsoOrNull(val: unknown): string | null {
  if (!val) return null;
  if (typeof (val as Timestamp).toDate === "function") {
    return (val as Timestamp).toDate().toISOString();
  }
  if (typeof val === "string") return val;
  return null;
}

/**
 * GET /api/admin/applications
 *
 * Lists verification applications by status with cursor pagination.
 */
export async function listAdminApplications(
  query: ListApplicationsQuery,
): Promise<ListApplicationsResponse> {
  const db = adminDb();
  const limit = query.limit ?? 20;

  let q = db
    .collection("verificationApplications")
    .where("status", "==", query.status)
    .orderBy("submittedAt", "desc")
    .limit(limit + 1);

  if (query.cursor) {
    const cursorSnap = await db.doc(`verificationApplications/${query.cursor}`).get();
    if (cursorSnap.exists) {
      q = q.startAfter(cursorSnap);
    }
  }

  const snap = await q.get();
  const hasMore = snap.docs.length > limit;
  const docs = hasMore ? snap.docs.slice(0, limit) : snap.docs;
  const nextCursor = hasMore && docs.length > 0 ? docs[docs.length - 1].id : null;

  const items: AdminApplication[] = docs.map((docSnap) => {
    const data = docSnap.data() as VerificationApplicationDoc;
    return {
      id: docSnap.id,
      uid: data.uid,
      fullName: data.fullName,
      phone: data.phone,
      specialty: data.specialty,
      institution: data.institution,
      registrationNumber: data.registrationNumber,
      councilName: data.councilName,
      registrationYear: data.registrationYear,
      documents: (data.documents ?? []).map((d) => ({
        fileName: d.fileName,
        kind: d.kind,
      })),
      status: data.status,
      reviewerUid: data.reviewerUid ?? null,
      reviewNote: data.reviewNote ?? null,
      submittedAt: toIso(data.submittedAt),
      reviewedAt: toIsoOrNull(data.reviewedAt),
    };
  });

  return { items, nextCursor };
}

/**
 * POST /api/admin/applications/:id/decision
 *
 * Approves, rejects, or requests info on a verification application.
 * Writes an audit log entry in the same transaction.
 */
export async function decideAdminApplication(
  user: AuthUser,
  id: string,
  req: ApplicationDecisionRequest,
): Promise<ApplicationDecisionResponse> {
  const db = adminDb();
  const appRef = db.doc(`verificationApplications/${id}`);

  let resultStatus: ApplicationDecisionResponse["status"] = req.decision;

  await db.runTransaction(async (tx) => {
    const appSnap = await tx.get(appRef);
    if (!appSnap.exists) {
      throw new ApiError("NOT_FOUND", "Verification application not found.");
    }

    const appData = appSnap.data() as VerificationApplicationDoc;
    const userRef = db.doc(`users/${appData.uid}`);
    const userSnap = await tx.get(userRef);

    if (!userSnap.exists) {
      throw new ApiError("NOT_FOUND", "Applicant user document not found.");
    }

    const fromStatus = appData.status;
    const toStatus = req.decision;
    const now = FieldValue.serverTimestamp();

    // 1. Update application doc
    tx.update(appRef, {
      status: toStatus,
      reviewerUid: user.uid,
      reviewNote: req.note ?? null,
      reviewedAt: now,
    });

    // 2. Update user doc
    if (toStatus === "approved") {
      tx.update(userRef, {
        "verification.status": "approved",
        "verification.verifiedAt": now,
        canContribute: true,
        lastActiveAt: now,
      });
    } else {
      tx.update(userRef, {
        "verification.status": toStatus,
        canContribute: false,
        lastActiveAt: now,
      });
    }

    // 3. Write audit log in same transaction
    const logRef = db.collection("auditLogs").doc();
    tx.set(logRef, {
      actorUid: user.uid,
      action: "application.decision",
      targetType: "verificationApplication",
      targetId: id,
      fromStatus,
      toStatus,
      note: req.note ?? null,
      at: now,
    });

    resultStatus = toStatus;
  });

  return { status: resultStatus };
}

/**
 * GET /api/admin/contributions
 *
 * Lists contributions by reviewable status with cursor pagination.
 */
export async function listAdminContributions(
  query: ListContributionsQuery,
): Promise<ListContributionsResponse> {
  const db = adminDb();
  const limit = query.limit ?? 20;

  let q = db
    .collection("contributions")
    .where("status", "==", query.status)
    .orderBy("submittedAt", "desc")
    .limit(limit + 1);

  if (query.cursor) {
    const cursorSnap = await db.doc(`contributions/${query.cursor}`).get();
    if (cursorSnap.exists) {
      q = q.startAfter(cursorSnap);
    }
  }

  const snap = await q.get();
  const hasMore = snap.docs.length > limit;
  const docs = hasMore ? snap.docs.slice(0, limit) : snap.docs;
  const nextCursor = hasMore && docs.length > 0 ? docs[docs.length - 1].id : null;

  // Batch-fetch contributor names from users collection
  const contributorUids = [...new Set(docs.map((d) => (d.data() as ContributionDoc).contributorUid))];
  const userSnaps = await Promise.all(contributorUids.map((uid) => db.doc(`users/${uid}`).get()));
  const nameMap = new Map<string, string>();
  for (const s of userSnaps) {
    if (s.exists) {
      nameMap.set(s.id, (s.data() as UserDoc)?.name ?? "Doctor");
    }
  }

  const items: AdminContribution[] = docs.map((docSnap) => {
    const data = docSnap.data() as ContributionDoc;
    return {
      id: docSnap.id,
      contributorUid: data.contributorUid,
      contributorName: nameMap.get(data.contributorUid) ?? "Doctor",
      specialty: data.specialty,
      title: data.title,
      type: data.type,
      text: data.text,
      audio: data.audio
        ? { mimeType: data.audio.mimeType, durationSec: data.audio.durationSec }
        : null,
      piiCheck: data.piiCheck ?? null,
      status: data.status as AdminContribution["status"],
      reviewerUid: data.reviewerUid ?? null,
      reviewNote: data.reviewNote ?? null,
      submittedAt: toIso(data.submittedAt),
      reviewedAt: toIsoOrNull(data.reviewedAt),
    };
  });

  return { items, nextCursor };
}

/**
 * POST /api/admin/contributions/:id/decision
 *
 * Approves, rejects, or asks for changes on a contribution.
 * Writes an audit log entry in the same transaction.
 */
export async function decideAdminContribution(
  user: AuthUser,
  id: string,
  req: ContributionDecisionRequest,
): Promise<ContributionDecisionResponse> {
  const db = adminDb();
  const docRef = db.doc(`contributions/${id}`);

  let resultStatus: ContributionDecisionResponse["status"] = req.decision;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    if (!snap.exists) {
      throw new ApiError("NOT_FOUND", "Contribution not found.");
    }

    const data = snap.data() as ContributionDoc;
    const fromStatus = data.status;
    const toStatus = req.decision;
    const now = FieldValue.serverTimestamp();

    tx.update(docRef, {
      status: toStatus,
      reviewerUid: user.uid,
      reviewNote: req.note ?? null,
      reviewedAt: now,
    });

    const logRef = db.collection("auditLogs").doc();
    tx.set(logRef, {
      actorUid: user.uid,
      action: "contribution.decision",
      targetType: "contribution",
      targetId: id,
      fromStatus,
      toStatus,
      note: req.note ?? null,
      at: now,
    });

    resultStatus = toStatus;
  });

  return { status: resultStatus };
}

/**
 * GET /api/admin/users
 *
 * Lists all registered users with verification status and referral counts.
 */
export async function listAdminUsers(query: ListUsersQuery): Promise<ListUsersResponse> {
  const db = adminDb();
  const limit = query.limit ?? 20;

  let q = db.collection("users").orderBy("createdAt", "desc").limit(limit + 1);

  if (query.cursor) {
    const cursorSnap = await db.doc(`users/${query.cursor}`).get();
    if (cursorSnap.exists) {
      q = q.startAfter(cursorSnap);
    }
  }

  const snap = await q.get();
  const hasMore = snap.docs.length > limit;
  const docs = hasMore ? snap.docs.slice(0, limit) : snap.docs;
  const nextCursor = hasMore && docs.length > 0 ? docs[docs.length - 1].id : null;

  const items: AdminUser[] = docs.map((docSnap) => {
    const data = docSnap.data() as UserDoc;
    return {
      uid: docSnap.id,
      name: data.name ?? "",
      email: data.email ?? "",
      specialty: data.specialty ?? null,
      role: data.role ?? "user",
      verificationStatus: data.verification?.status ?? "none",
      canContribute: data.canContribute ?? false,
      referralCount: data.referralCount ?? 0,
      qualifiedReferralCount: data.qualifiedReferralCount ?? 0,
      createdAt: toIso(data.createdAt),
      lastActiveAt: toIso(data.lastActiveAt),
    };
  });

  return { items, nextCursor };
}

/**
 * GET /api/admin/audit-logs
 *
 * Lists audit logs, newest first, with cursor pagination.
 */
export async function listAdminAuditLogs(
  query: ListAuditLogsQuery,
): Promise<ListAuditLogsResponse> {
  const db = adminDb();
  const limit = query.limit ?? 20;

  let q = db.collection("auditLogs").orderBy("at", "desc").limit(limit + 1);

  if (query.cursor) {
    const cursorSnap = await db.doc(`auditLogs/${query.cursor}`).get();
    if (cursorSnap.exists) {
      q = q.startAfter(cursorSnap);
    }
  }

  const snap = await q.get();
  const hasMore = snap.docs.length > limit;
  const docs = hasMore ? snap.docs.slice(0, limit) : snap.docs;
  const nextCursor = hasMore && docs.length > 0 ? docs[docs.length - 1].id : null;

  const items: AdminAuditLog[] = docs.map((docSnap) => {
    const data = docSnap.data() as AuditLogDoc;
    return {
      id: docSnap.id,
      actorUid: data.actorUid,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      fromStatus: data.fromStatus ?? null,
      toStatus: data.toStatus ?? null,
      note: data.note ?? null,
      at: toIso(data.at),
    };
  });

  return { items, nextCursor };
}

/**
 * PATCH /api/admin/config
 *
 * Updates config/app toggles and spend cap, writing an audit log in the same transaction.
 */
export async function updateAdminConfig(
  user: AuthUser,
  req: UpdateConfigRequest,
): Promise<UpdateConfigResponse> {
  const db = adminDb();
  const configRef = db.doc("config/app");

  let updatedConfig: AppConfig = {
    aiEnabled: true,
    groupsEnabled: true,
    contributionsEnabled: true,
    dailySpendCapUsd: DEFAULT_DAILY_SPEND_CAP_USD,
  };

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(configRef);
    const existing = snap.exists ? (snap.data() as Partial<AppConfig>) : {};

    updatedConfig = {
      aiEnabled: req.aiEnabled ?? existing.aiEnabled ?? true,
      groupsEnabled: req.groupsEnabled ?? existing.groupsEnabled ?? true,
      contributionsEnabled: req.contributionsEnabled ?? existing.contributionsEnabled ?? true,
      dailySpendCapUsd:
        req.dailySpendCapUsd ?? existing.dailySpendCapUsd ?? DEFAULT_DAILY_SPEND_CAP_USD,
    };

    tx.set(configRef, updatedConfig);

    const changeDescriptions = Object.entries(req)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    const logRef = db.collection("auditLogs").doc();
    tx.set(logRef, {
      actorUid: user.uid,
      action: "config.update",
      targetType: "config",
      targetId: "app",
      fromStatus: null,
      toStatus: null,
      note: changeDescriptions,
      at: FieldValue.serverTimestamp(),
    });
  });

  return { config: updatedConfig };
}
