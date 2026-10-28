"use client";

import { ProfileScreen } from "@/components/account/ProfileScreen";
import { signedInUser } from "@/lib/fixtures/users";

/** Client side of /profile. Static: the fixture user. At integration: useProfile(). */
export function ProfileContainer() {
  return <ProfileScreen user={signedInUser} />;
}
