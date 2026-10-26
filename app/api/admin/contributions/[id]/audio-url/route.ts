import { adminDownloadUrlResponseSchema } from "@/lib/contracts/admin";
import { getContributionAudioDownloadUrl } from "@/lib/server/admin/service";
import { route } from "@/lib/server/http/route";

/**
 * GET /api/admin/contributions/:id/audio-url
 *
 * Generates a short-lived signed download URL for a contribution's audio.
 * Contract: lib/contracts/admin.ts
 */
export const GET = route("/api/admin/contributions/[id]/audio-url", {
  access: "admin",
  response: adminDownloadUrlResponseSchema,
  handler: async ({ params }) => {
    return getContributionAudioDownloadUrl(params.id);
  },
});
