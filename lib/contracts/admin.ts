import { z } from "zod";
import { docIdSchema, isoDateSchema, pageOf, pageQuerySchema } from "./common";
import { piiCheckSchema } from "./contributions";
import { verificationDocumentKindSchema } from "./verification";

/** Every /api/admin/* route checks the `admin` custom claim; others get FORBIDDEN. */

const reviewNoteSchema = z.string().trim().max(1000).nullable();

/** A note is required unless the decision is an approval. */
function decisionSchema<T extends readonly [string, ...string[]]>(decisions: T) {
  return z
    .object({ decision: z.enum(decisions), note: reviewNoteSchema })
    .refine((body) => body.decision === "approved" || Boolean(body.note), {
      message: "Add a note for the applicant",
      path: ["note"],
    });
}

/* ---------- verification applications ---------- */

export const applicationStatusSchema = z.enum(["pending", "approved", "rejected", "needs_info"]);

/** GET /api/admin/applications?status=&cursor=&limit= */
export const listApplicationsQuerySchema = pageQuerySchema.extend({ status: applicationStatusSchema });
export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;

export const applicationSchema = z.object({
  id: docIdSchema,
  uid: docIdSchema,
  fullName: z.string(),
  phone: z.string(),
  specialty: z.string(),
  institution: z.string(),
  registrationNumber: z.string(),
  councilName: z.string(),
  registrationYear: z.number().int(),
  documents: z.array(z.object({ fileName: z.string(), kind: verificationDocumentKindSchema })),
  status: applicationStatusSchema,
  reviewerUid: z.string().nullable(),
  reviewNote: z.string().nullable(),
  submittedAt: isoDateSchema,
  reviewedAt: isoDateSchema.nullable(),
});
export type AdminApplication = z.infer<typeof applicationSchema>;

export const listApplicationsResponseSchema = pageOf(applicationSchema);
export type ListApplicationsResponse = z.infer<typeof listApplicationsResponseSchema>;

/** POST /api/admin/applications/:id/decision: writes the audit log in the same transaction. */
export const applicationDecisionRequestSchema = decisionSchema(["approved", "rejected", "needs_info"] as const);
export type ApplicationDecisionRequest = z.infer<typeof applicationDecisionRequestSchema>;

export const applicationDecisionResponseSchema = z.object({ status: applicationStatusSchema });
export type ApplicationDecisionResponse = z.infer<typeof applicationDecisionResponseSchema>;

/* ---------- contributions ---------- */

export const reviewableContributionStatusSchema = z.enum(["submitted", "approved", "rejected", "needs_changes"]);

/** GET /api/admin/contributions?status=&cursor=&limit= */
export const listContributionsQuerySchema = pageQuerySchema.extend({
  status: reviewableContributionStatusSchema,
});
export type ListContributionsQuery = z.infer<typeof listContributionsQuerySchema>;

export const adminContributionSchema = z.object({
  id: docIdSchema,
  contributorUid: docIdSchema,
  contributorName: z.string(),
  specialty: z.string(),
  title: z.string(),
  type: z.enum(["text", "voice"]),
  text: z.string(),
  audio: z.object({ mimeType: z.string(), durationSec: z.number() }).nullable(),
  piiCheck: piiCheckSchema.nullable(),
  status: reviewableContributionStatusSchema,
  reviewerUid: z.string().nullable(),
  reviewNote: z.string().nullable(),
  submittedAt: isoDateSchema,
  reviewedAt: isoDateSchema.nullable(),
});
export type AdminContribution = z.infer<typeof adminContributionSchema>;

export const listContributionsResponseSchema = pageOf(adminContributionSchema);
export type ListContributionsResponse = z.infer<typeof listContributionsResponseSchema>;

/** POST /api/admin/contributions/:id/decision: writes the audit log in the same transaction. */
export const contributionDecisionRequestSchema = decisionSchema(["approved", "rejected", "needs_changes"] as const);
export type ContributionDecisionRequest = z.infer<typeof contributionDecisionRequestSchema>;

export const contributionDecisionResponseSchema = z.object({ status: reviewableContributionStatusSchema });
export type ContributionDecisionResponse = z.infer<typeof contributionDecisionResponseSchema>;

/* ---------- users ---------- */

/** GET /api/admin/users?cursor=&limit= */
export const listUsersQuerySchema = pageQuerySchema;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const adminUserSchema = z.object({
  uid: docIdSchema,
  name: z.string(),
  email: z.string(),
  specialty: z.string().nullable(),
  role: z.enum(["user", "admin"]),
  verificationStatus: z.enum(["none", "pending", "approved", "rejected", "needs_info"]),
  canContribute: z.boolean(),
  referralCount: z.number().int(),
  qualifiedReferralCount: z.number().int(),
  createdAt: isoDateSchema,
  lastActiveAt: isoDateSchema,
});
export type AdminUser = z.infer<typeof adminUserSchema>;

export const listUsersResponseSchema = pageOf(adminUserSchema);
export type ListUsersResponse = z.infer<typeof listUsersResponseSchema>;

/* ---------- audit log ---------- */

/** GET /api/admin/audit-logs?cursor=&limit=: newest first. */
export const listAuditLogsQuerySchema = pageQuerySchema;
export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;

export const auditLogSchema = z.object({
  id: docIdSchema,
  actorUid: docIdSchema,
  action: z.string(),
  targetType: z.enum(["verificationApplication", "contribution", "config"]),
  targetId: z.string(),
  fromStatus: z.string().nullable(),
  toStatus: z.string().nullable(),
  note: z.string().nullable(),
  at: isoDateSchema,
});
export type AdminAuditLog = z.infer<typeof auditLogSchema>;

export const listAuditLogsResponseSchema = pageOf(auditLogSchema);
export type ListAuditLogsResponse = z.infer<typeof listAuditLogsResponseSchema>;

/* ---------- config ---------- */

export const appConfigSchema = z.object({
  aiEnabled: z.boolean(),
  groupsEnabled: z.boolean(),
  contributionsEnabled: z.boolean(),
  dailySpendCapUsd: z.number().min(0).max(100),
});
export type AppConfig = z.infer<typeof appConfigSchema>;

/** PATCH /api/admin/config: any subset of the toggles and the spend cap. */
export const updateConfigRequestSchema = appConfigSchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, "Nothing to update");
export type UpdateConfigRequest = z.infer<typeof updateConfigRequestSchema>;

export const updateConfigResponseSchema = z.object({ config: appConfigSchema });
export type UpdateConfigResponse = z.infer<typeof updateConfigResponseSchema>;

/* ---------- admin downloads ---------- */

export const applicationDocumentUrlQuerySchema = z.object({
  kind: verificationDocumentKindSchema.optional(),
  fileName: z.string().optional(),
});
export type ApplicationDocumentUrlQuery = z.infer<typeof applicationDocumentUrlQuerySchema>;

export const adminDownloadUrlResponseSchema = z.object({
  url: z.url(),
  expiresAt: isoDateSchema,
});
export type AdminDownloadUrlResponse = z.infer<typeof adminDownloadUrlResponseSchema>;

