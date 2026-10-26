import {
  applicationDecisionRequestSchema,
  applicationDecisionResponseSchema,
} from "@/lib/contracts/admin";
import { decideAdminApplication } from "@/lib/server/admin/service";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/admin/applications/:id/decision
 *
 * Approves, rejects or requests info on a verification application.
 * Contract: lib/contracts/admin.ts
 */
export const POST = route("/api/admin/applications/[id]/decision", {
  access: "admin",
  body: applicationDecisionRequestSchema,
  response: applicationDecisionResponseSchema,
  handler: async ({ user, params, body }) => {
    return decideAdminApplication(user, params.id, body);
  },
});
