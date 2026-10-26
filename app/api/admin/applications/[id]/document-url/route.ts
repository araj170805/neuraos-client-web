import {
  adminDownloadUrlResponseSchema,
  applicationDocumentUrlQuerySchema,
} from "@/lib/contracts/admin";
import { getApplicationDocumentDownloadUrl } from "@/lib/server/admin/service";
import { route } from "@/lib/server/http/route";

/**
 * GET /api/admin/applications/:id/document-url
 *
 * Generates a short-lived signed download URL for an applicant's document.
 * Contract: lib/contracts/admin.ts
 */
export const GET = route("/api/admin/applications/[id]/document-url", {
  access: "admin",
  query: applicationDocumentUrlQuerySchema,
  response: adminDownloadUrlResponseSchema,
  handler: async ({ params, query }) => {
    return getApplicationDocumentDownloadUrl(params.id, query);
  },
});
