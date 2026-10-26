import {
  submitVerificationRequestSchema,
  submitVerificationResponseSchema,
} from "@/lib/contracts/verification";
import { submitVerification } from "@/lib/server/account/verification";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/verification
 *
 * Submits or resubmits a verification application.
 * Sets the application and users.verification.status to pending.
 * Contract: lib/contracts/verification.ts
 */
export const POST = route("/api/verification", {
  access: "user",
  body: submitVerificationRequestSchema,
  response: submitVerificationResponseSchema,
  handler: async ({ user, body }) => {
    return submitVerification(user, body);
  },
});
