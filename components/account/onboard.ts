import { TERMS_VERSION } from "@/components/account/options";
import { clearReferralCode, readReferralCode } from "@/components/account/referralCookie";
import { api } from "@/lib/api/client";

const started = new Set<string>();

/**
 * POST /api/onboarding once per page load per user (the route is safe to repeat).
 * Creates the user doc and referral code on first sign-in and counts the referral.
 * Terms were accepted on the sign-in screen, the only way to sign in.
 */
export async function onboard(uid: string): Promise<void> {
  if (started.has(uid)) return;
  started.add(uid);
  try {
    await api.onboarding.complete({ referralCode: readReferralCode(), termsVersion: TERMS_VERSION });
    clearReferralCode();
  } catch (error) {
    started.delete(uid);
    throw error;
  }
}
