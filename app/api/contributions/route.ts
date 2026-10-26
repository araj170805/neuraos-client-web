import {
  createContributionRequestSchema,
  createContributionResponseSchema,
} from "@/lib/contracts/contributions";
import { createContribution } from "@/lib/server/account/contributions";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/contributions
 *
 * Creates a new draft contribution for a verified doctor.
 * Contract: lib/contracts/contributions.ts
 */
export const POST = route("/api/contributions", {
  access: "user",
  body: createContributionRequestSchema,
  response: createContributionResponseSchema,
  handler: async ({ user, body }) => {
    return createContribution(user, body);
  },
});
