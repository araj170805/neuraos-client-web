"use client";

import { TopBar } from "@/components/app/TopBar";
import { PiiText } from "@/components/account/PiiText";
import { contributionReviewPill, isoDay } from "@/components/admin/adminLabels";
import { ContributorCard } from "@/components/admin/ContributorCard";
import { DecidedPanel } from "@/components/admin/DecidedPanel";
import { DecisionPanel } from "@/components/admin/DecisionPanel";
import { HistoryPanel } from "@/components/admin/HistoryPanel";
import { PiiFlagPill } from "@/components/admin/PiiFlagPill";
import { reviewHistory } from "@/components/admin/reviewHistory";
import { VoicePlayer } from "@/components/admin/VoicePlayer";
import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/toastStore";
import { errorMessage } from "@/lib/api/client";
import type { AdminContribution, AdminUser, ContributionDecisionRequest } from "@/lib/contracts/admin";

type ContributionReviewProps = {
  contribution: AdminContribution;
  contributor: AdminUser | undefined;
  registration: string | null;
  history: AdminContribution[];
  reviewer: string;
  /** POST /api/admin/contributions/:id/decision. */
  onDecide: (body: ContributionDecisionRequest) => Promise<void>;
  /** Signed URL for the voice recording. */
  audioUrl: () => Promise<string>;
};

/** Case-study review (design "Contribution review"): the case, PII flags, contributor and the decision. */
export function ContributionReview({ contribution: c, contributor, registration, history, reviewer, onDecide, audioUrl }: ContributionReviewProps) {
  const pill = contributionReviewPill[c.status];
  const flags = c.piiCheck?.flags ?? [];
  const code = c.id.toUpperCase();

  return (
    <>
      <TopBar title={`${code} · ${c.contributorName}`} subtitle={`Contribution · ${pill.label}`} backHref="/admin/contributions" />
      <div className="min-h-0 flex-1 overflow-auto px-4 pt-2 pb-14 app:px-7">
        <div className="mx-auto flex max-w-admin flex-wrap items-start gap-6">
          <div className="flex min-w-0 flex-[3_1_33.75rem] flex-col gap-5.5">
            <Panel size="lg" className="flex flex-col gap-3 p-5.5">
              <div className="flex flex-wrap items-center gap-2">
                <Text as="span" variant="mono-sm" className="mr-auto text-muted">
                  {code}
                </Text>
                <Text as="span" variant="meta-md" className="inline-flex h-6 items-center gap-1.5 rounded-full bg-field pr-2.5 pl-2 text-ink-soft">
                  <Icon name={c.type === "voice" ? "mic" : "text"} size={13} />
                  {c.type === "voice" ? "Voice" : "Text"}
                </Text>
                <PiiFlagPill count={flags.length} />
                <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
              </div>
              <Text as="h2" variant="app-title" className="text-balance">
                {c.title}
              </Text>
              <Text variant="caption" className="text-muted">
                {c.specialty} · Submitted {isoDay(c.submittedAt)}
              </Text>
            </Panel>

            {c.audio && <VoicePlayer id={c.id} seconds={c.audio.durationSec} loadUrl={audioUrl} />}

            <section aria-labelledby="submitted-text">
              <SectionLabel
                id="submitted-text"
                aside={
                  <Text as="span" variant="meta-md" className="flex items-center gap-2 text-muted">
                    <span aria-hidden="true" className="h-2.5 w-3.5 rounded-xs bg-pii inset-shadow-pii" />
                    {flags.length
                      ? `${flags.length} possible ${flags.length === 1 ? "identifier" : "identifiers"} flagged`
                      : "No identifiers flagged"}
                  </Text>
                }
              >
                {c.type === "voice" ? "Transcript" : "Submitted text"}
              </SectionLabel>
              <Panel className="px-6 py-5.5">
                <PiiText text={c.text} flags={flags} />
              </Panel>
            </section>
          </div>

          <div className="flex min-w-0 flex-[1_1_20rem] flex-col gap-5.5 app:sticky app:top-0">
            <ContributorCard user={contributor} name={c.contributorName} registration={registration} contributions={history} />
            {c.status === "submitted" ? (
              <DecisionPanel
                kind="contribution"
                subject={code}
                person={c.contributorName}
                onDecide={async (status, note) => {
                  if (status === "needs_info") return;
                  try {
                    await onDecide({ decision: status, note });
                    showToast(`${code}: ${contributionReviewPill[status].label}`);
                  } catch (error) {
                    showToast(errorMessage(error));
                  }
                }}
              />
            ) : (
              <DecidedPanel status={c.status} reviewer={reviewer} reviewedAt={c.reviewedAt} note={c.reviewNote} />
            )}
            <HistoryPanel entries={reviewHistory(c, c.contributorName, reviewer)} />
          </div>
        </div>
      </div>
    </>
  );
}
