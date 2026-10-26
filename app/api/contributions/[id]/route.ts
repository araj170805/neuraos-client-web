import { okResponseSchema } from "@/lib/contracts/common";
import { updateContributionRequestSchema } from "@/lib/contracts/contributions";
import { updateContribution } from "@/lib/server/account/contributions";
import { route } from "@/lib/server/http/route";

/**
 * PATCH /api/contributions/:id
 *
 * Updates a draft or needs_changes contribution.
 * Contract: lib/contracts/contributions.ts
 */
export const PATCH = route("/api/contributions/[id]", {
  access: "user",
  body: updateContributionRequestSchema,
  response: okResponseSchema,
  handler: async ({ user, params, body }) => {
    return updateContribution(user, params.id, body);
  },
});
