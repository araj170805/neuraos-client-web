"use client";

import { TopBar } from "@/components/app/TopBar";
import { CheckingScreen } from "@/components/account/CheckingScreen";
import { ContributeGate } from "@/components/account/ContributeGate";
import { SPECIALTIES } from "@/components/account/options";
import { PiiDialog } from "@/components/account/PiiDialog";
import { useCaseStudyDraft, type DraftFields } from "@/components/account/useCaseStudyDraft";
import { VoiceRecorder } from "@/components/account/VoiceRecorder";
import { WritePanel } from "@/components/account/WritePanel";
import { Button } from "@/components/ui/Button";
import { FieldRow } from "@/components/ui/FieldRow";
import { FieldSelectRow } from "@/components/ui/FieldSelectRow";
import { Icon } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Notice";
import { Panel } from "@/components/ui/Panel";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { ContributionType } from "@/lib/types";

type ContributionEditorProps = {
  /** Null for a new case study; the draft is created on the first save. */
  id: string | null;
  initial: DraftFields;
  reviewNote: string | null;
};

/** New case study or a draft / needs-changes edit (design "New case study"). */
export function ContributionEditor({ id, initial, reviewNote }: ContributionEditorProps) {
  const draft = useCaseStudyDraft(id, initial);
  const { title, specialty, type, text, transcript } = draft.fields;
  const isNew = id === null;

  if (draft.stage.kind === "paused") {
    return (
      <>
        <TopBar title={title || "New case study"} />
        <ContributeGate reason="paused" />
      </>
    );
  }

  if (draft.stage.kind === "checking") {
    return (
      <>
        <TopBar title={title || "New case study"} subtitle="Submitting" />
        <CheckingScreen />
      </>
    );
  }

  return (
    <>
      <TopBar title={isNew ? "New case study" : title} subtitle={isNew ? "Train NeuraOS" : "Draft"} />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto px-4 pt-1 pb-5 app:px-6 app:pb-7">
        <div className="mx-auto flex w-full max-w-form flex-1 flex-col gap-3.5">
          {reviewNote && (
            <Notice tone="warning">
              <span className="font-medium">Reviewer:</span> {reviewNote}
            </Notice>
          )}

          <Panel className="grid divide-ink/7 overflow-hidden max-sm:divide-y sm:grid-cols-[1fr_15rem] sm:divide-x">
            <FieldRow label="Title" value={title} maxLength={160} placeholder="e.g. Fast AF with heart failure" onChange={(e) => draft.edit({ title: e.target.value })} />
            <FieldSelectRow label="Specialty" value={specialty} onChange={(e) => draft.edit({ specialty: e.target.value })}>
              {SPECIALTIES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </FieldSelectRow>
          </Panel>

          {draft.isNew && (
            <SegmentedControl<ContributionType>
              label="How do you want to add the case?"
              value={type}
              onValueChange={(value) => draft.edit({ type: value })}
              className="w-full max-w-105 shrink-0"
              segments={[
                { value: "text", label: "Write it", icon: "pencil" },
                { value: "voice", label: "Talk it through", icon: "mic" },
              ]}
            />
          )}

          {type === "text" ? (
            <WritePanel text={text} saved={draft.saved} onChange={(value) => draft.edit({ text: value })} />
          ) : (
            <VoiceRecorder
              transcript={transcript}
              onTranscript={(value) => draft.edit({ transcript: value })}
              transcribe={draft.transcribe}
              blockedReason={draft.titleOk ? null : "Add a title before you record."}
            />
          )}

          <div className="flex shrink-0 flex-wrap justify-end gap-2.5">
            <Button look="app-light-lg" disabled={draft.saving} onClick={draft.save}>
              {draft.saving ? "Saving…" : "Save draft"}
            </Button>
            <Button look="app-accent-lg" className="min-w-60" disabled={!draft.canSubmit} onClick={() => draft.submit()}>
              Submit case study
              <Icon name="arrow-right" size={14} />
            </Button>
          </div>
        </div>
      </div>

      <PiiDialog
        open={draft.stage.kind === "flagged"}
        flags={draft.stage.kind === "flagged" ? draft.stage.flags : []}
        onEdit={() => draft.setStage({ kind: "editing" })}
        onSubmitAnyway={() => draft.submit(true)}
      />
    </>
  );
}
