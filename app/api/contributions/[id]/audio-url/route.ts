import {
  audioUploadUrlRequestSchema,
  audioUploadUrlResponseSchema,
} from "@/lib/contracts/contributions";
import { getContributionAudioUploadUrl } from "@/lib/server/account/contributions";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/contributions/:id/audio-url
 *
 * Generates a signed PUT URL for uploading audio to a voice contribution.
 * Contract: lib/contracts/contributions.ts
 */
export const POST = route("/api/contributions/[id]/audio-url", {
  access: "user",
  body: audioUploadUrlRequestSchema,
  response: audioUploadUrlResponseSchema,
  handler: async ({ user, params, body }) => {
    return getContributionAudioUploadUrl(user, params.id, body);
  },
});
