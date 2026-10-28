"use client";

import { useProfile } from "@/hooks/account/useProfile";

export type Referral = { code: string; invited: number; qualified: number };

/** The user's referral code and counts (ReferralCard props), or null until the profile loads. */
export function useReferral(): Referral | null {
  const { data } = useProfile();
  if (!data) return null;
  return { code: data.referralCode, invited: data.referralCount, qualified: data.qualifiedReferralCount };
}
