import {
  verificationUploadUrlRequestSchema,
  verificationUploadUrlResponseSchema,
} from "@/lib/contracts/verification";
import { getVerificationUploadUrl } from "@/lib/server/account/verification";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/verification/upload-url
 *
 * Returns a short-lived signed PUT URL for uploading verification documents
 * under `verification/{uid}/`.
 * Contract: lib/contracts/verification.ts
 */
export const POST = route("/api/verification/upload-url", {
  access: "user",
  body: verificationUploadUrlRequestSchema,
  response: verificationUploadUrlResponseSchema,
  handler: async ({ user, body }) => {
    return getVerificationUploadUrl(user, body);
  },
});
