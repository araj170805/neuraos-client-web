import {
  submitContributionRequestSchema,
  submitContributionResponseSchema,
} from "@/lib/contracts/contributions";
import { submitContribution } from "@/lib/server/account/contributions";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/contributions/:id/submit
 *
 * Runs PII check on the contribution text and submits if clean or confirmed.
 * Contract: lib/contracts/contributions.ts
 */
export const POST = route("/api/contributions/[id]/submit", {
  access: "user",
  body: submitContributionRequestSchema,
  response: submitContributionResponseSchema,
  handler: async ({ user, params, body }) => {
    return submitContribution(user, params.id, body);
  },
});
