import { REFERRAL_COOKIE_NAME, referralCodeSchema } from "@/lib/contracts/onboarding";
import { REFERRAL_COOKIE_DAYS } from "@/lib/limits";

/** Stores a valid ?ref= code for REFERRAL_COOKIE_DAYS (SPEC.md section 10). */
export function saveReferralCode(code: string) {
  const parsed = referralCodeSchema.safeParse(code.toUpperCase());
  if (!parsed.success) return;
  const maxAge = REFERRAL_COOKIE_DAYS * 24 * 60 * 60;
  document.cookie = `${REFERRAL_COOKIE_NAME}=${parsed.data}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

/** The waiting referral code, or null. */
export function readReferralCode(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${REFERRAL_COOKIE_NAME}=([^;]*)`));
  const parsed = referralCodeSchema.safeParse(match?.[1] ?? "");
  return parsed.success ? parsed.data : null;
}

/** Drops the code once onboarding has used it. */
export function clearReferralCode() {
  document.cookie = `${REFERRAL_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
}
