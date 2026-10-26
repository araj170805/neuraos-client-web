import { transcribeResponseSchema } from "@/lib/contracts/contributions";
import { transcribeContribution } from "@/lib/server/account/contributions";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/contributions/:id/transcribe
 *
 * Runs transcription on uploaded voice audio and sets draftText.
 * Contract: lib/contracts/contributions.ts
 */
export const POST = route("/api/contributions/[id]/transcribe", {
  access: "user",
  response: transcribeResponseSchema,
  handler: async ({ user, params }) => {
    return transcribeContribution(user, params.id);
  },
});
