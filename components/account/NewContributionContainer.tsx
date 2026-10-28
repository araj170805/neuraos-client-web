"use client";

import { ContributeGate } from "@/components/account/ContributeGate";
import { ContributionEditor } from "@/components/account/ContributionEditor";
import { PageStatus } from "@/components/app/PageStatus";
import { TopBar } from "@/components/app/TopBar";
import { useProfile } from "@/hooks/account/useProfile";

/** Client side of /contribute/new: verified doctors get the editor. */
export function NewContributionContainer() {
  const profile = useProfile();
  if (!profile.data) return <PageStatus error={profile.error} />;
  if (!profile.data.canContribute) {
    return (
      <>
        <TopBar title="New case study" />
        <ContributeGate reason="unverified" />
      </>
    );
  }
  return (
    <ContributionEditor
      id={null}
      reviewNote={null}
      initial={{
        title: "",
        specialty: profile.data.specialty ?? "General practice",
        type: "text",
        text: "",
        transcript: null,
      }}
    />
  );
}
