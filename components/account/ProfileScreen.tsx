"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { SPECIALTIES } from "@/components/account/options";
import { ProfileHeader } from "@/components/account/ProfileHeader";
import { ReferralCard } from "@/components/account/ReferralCard";
import { VerificationCard } from "@/components/account/VerificationCard";
import { Button } from "@/components/ui/Button";
import { FieldRow } from "@/components/ui/FieldRow";
import { FieldSelectRow } from "@/components/ui/FieldSelectRow";
import { Panel } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Icon } from "@/components/ui/Icon";
import { showToast } from "@/components/ui/toastStore";
import { useAuth } from "@/hooks/useAuth";
import type { UserDoc } from "@/lib/types";

/**
 * Account page (design "Account", assistant mode). Static: Save only updates
 * local state; there is no profile update route in SPEC.md yet.
 */
export function ProfileScreen({ user }: { user: UserDoc }) {
  const [saved, setSaved] = useState({ name: user.name, specialty: user.specialty ?? "" });
  const [draft, setDraft] = useState(saved);
  const dirty = draft.name.trim() !== saved.name || draft.specialty !== saved.specialty;
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <>
      <TopBar title="Profile" subtitle="Signed in with Google">
        <Button
          look="app-light-sm"
          onClick={async () => {
            await signOut();
            router.replace("/");
          }}
        >
          <Icon name="sign-out" size={14} />
          <span className="max-sm:sr-only">Sign out</span>
        </Button>
        <Button
          look="app-accent-sm"
          disabled={!dirty || !draft.name.trim()}
          onClick={() => {
            setSaved({ ...draft, name: draft.name.trim() });
            showToast("Profile saved");
          }}
        >
          Save changes
        </Button>
      </TopBar>
      <div className="min-h-0 flex-1 overflow-auto px-4 pt-2 pb-14 app:px-6">
        <div className="mx-auto flex max-w-page flex-col gap-7.5">
          <ProfileHeader name={saved.name} email={user.email} />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,22.5rem),1fr))] items-start gap-7">
            <section aria-labelledby="your-details">
              <SectionLabel id="your-details">Your details</SectionLabel>
              <Panel divided>
                <FieldRow
                  label="Full name"
                  value={draft.name}
                  autoComplete="name"
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
                <FieldSelectRow
                  label="Specialty"
                  value={draft.specialty}
                  onChange={(event) => setDraft({ ...draft, specialty: event.target.value })}
                >
                  <option value="">Choose a specialty</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </FieldSelectRow>
                <FieldRow label="Email" value={user.email} readOnly className="text-muted" />
              </Panel>
            </section>
            <div className="flex flex-col gap-7">
              <section aria-labelledby="referrals">
                <SectionLabel id="referrals">Referrals</SectionLabel>
                <ReferralCard code={user.referralCode} invited={user.referralCount} qualified={user.qualifiedReferralCount} />
              </section>
              <section aria-labelledby="verification">
                <SectionLabel id="verification">Verification</SectionLabel>
                <VerificationCard status={user.verification.status} />
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
