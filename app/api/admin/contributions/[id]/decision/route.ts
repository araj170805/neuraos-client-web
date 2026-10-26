import {
  contributionDecisionRequestSchema,
  contributionDecisionResponseSchema,
} from "@/lib/contracts/admin";
import { decideAdminContribution } from "@/lib/server/admin/service";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/admin/contributions/:id/decision
 *
 * Approves, rejects, or asks for changes on a contribution.
 * Contract: lib/contracts/admin.ts
 */
export const POST = route("/api/admin/contributions/[id]/decision", {
  access: "admin",
  body: contributionDecisionRequestSchema,
  response: contributionDecisionResponseSchema,
  handler: async ({ user, params, body }) => {
    return decideAdminContribution(user, params.id, body);
  },
});
