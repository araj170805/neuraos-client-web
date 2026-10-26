import { onboardingRequestSchema, onboardingResponseSchema } from "@/lib/contracts/onboarding";
import { route } from "@/lib/server/http/route";
import { runOnboarding } from "@/lib/server/account/onboarding";

/**
 * POST /api/onboarding
 *
 * Called after every sign-in. Creates the user doc and referral code on
 * first sign-in and counts the referral; safe to repeat for existing users.
 * Contract: lib/contracts/onboarding.ts
 */
export const POST = route("/api/onboarding", {
  access: "user",
  body: onboardingRequestSchema,
  response: onboardingResponseSchema,
  handler: async ({ user, body }) => {
    return runOnboarding(user, body.referralCode, body.termsVersion);
  },
});
