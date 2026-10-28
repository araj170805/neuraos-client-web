"use client";

import { ProfileScreen } from "@/components/account/ProfileScreen";
import { PageStatus } from "@/components/app/PageStatus";
import { useProfile } from "@/hooks/account/useProfile";

/** Client side of /profile: the live user doc. */
export function ProfileContainer() {
  const profile = useProfile();
  if (!profile.data) {
    return <PageStatus error={profile.error} label={profile.loading ? "Loading…" : "Setting up your account…"} />;
  }
  return <ProfileScreen user={profile.data} onSave={profile.save} />;
}
