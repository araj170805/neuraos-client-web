"use client";

import { notFound } from "next/navigation";
import { ContributionEditor } from "@/components/account/ContributionEditor";
import { ContributionView } from "@/components/account/ContributionView";
import { PageStatus } from "@/components/app/PageStatus";
import { useContribution } from "@/hooks/account/useContribution";

/** Client side of /contribute/[id]: drafts and needs-changes open in the editor; the rest are read-only. */
export function ContributionContainer({ id }: { id: string }) {
  const { data: c, loading, error } = useContribution(id);
  if (loading || error) return <PageStatus error={error} />;
  if (!c) notFound();

  const editable = c.status === "draft" || c.status === "needs_changes";
  if (!editable) return <ContributionView contribution={c} />;

  return (
    <ContributionEditor
      key={c.id}
      id={c.id}
      reviewNote={c.status === "needs_changes" ? c.reviewNote : null}
      initial={{
        title: c.title,
        specialty: c.specialty,
        type: c.type,
        text: c.text,
        transcript: c.type === "voice" ? c.text || (c.transcript?.draftText ?? null) : null,
      }}
    />
  );
}
