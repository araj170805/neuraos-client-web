import type { Metadata } from "next";
import { ProfileContainer } from "@/components/account/ProfileContainer";

export const metadata: Metadata = { title: "Profile — NeuraOS" };

export default function ProfilePage() {
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <ProfileContainer />
    </main>
  );
}
