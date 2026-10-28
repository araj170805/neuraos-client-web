"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CONTRIBUTION_TERMS_VERSION } from "@/components/account/options";
import { showToast } from "@/components/ui/toastStore";
import { useContributionActions } from "@/hooks/account/useContributionActions";
import type { Recording } from "@/hooks/account/useVoiceRecorder";
import { ApiError, errorMessage } from "@/lib/api/client";
import type { ContributionType, PiiFlag } from "@/lib/types";

export type DraftFields = {
  title: string;
  specialty: string;
  type: ContributionType;
  text: string;
  /** Voice drafts: the transcript to review, or null before recording. */
  transcript: string | null;
};

export type DraftStage =
  | { kind: "editing" }
  | { kind: "checking" }
  | { kind: "flagged"; flags: PiiFlag[] }
  | { kind: "paused" };

/**
 * State and API calls behind the case-study editor: creates the draft on the
 * first save, keeps it updated, uploads and transcribes recordings, and submits
 * through the server's PII check.
 */
export function useCaseStudyDraft(draftId: string | null, initial: DraftFields) {
  const actions = useContributionActions();
  const router = useRouter();
  const [id, setId] = useState(draftId);
  const [fields, setFields] = useState(initial);
  const [saved, setSaved] = useState(draftId !== null);
  const [saving, setSaving] = useState(false);
  const [stage, setStage] = useState<DraftStage>({ kind: "editing" });

  const body = fields.type === "voice" ? (fields.transcript ?? "") : fields.text;
  const titleOk = fields.title.trim().length >= 3;

  function edit(patch: Partial<DraftFields>) {
    setFields((f) => ({ ...f, ...patch }));
    setSaved(false);
  }

  async function persist(): Promise<string> {
    if (!titleOk) throw new ApiError("INVALID_REQUEST", "Add a title of at least 3 characters.", 400);
    const values = { title: fields.title.trim(), specialty: fields.specialty, text: body };
    if (id) {
      await actions.update(id, values);
      return id;
    }
    const created = await actions.create({ type: fields.type, ...values });
    setId(created);
    return created;
  }

  function fail(error: unknown) {
    if (error instanceof ApiError && error.code === "FEATURE_OFF") return setStage({ kind: "paused" });
    setStage({ kind: "editing" });
    showToast(errorMessage(error));
  }

  async function save() {
    setSaving(true);
    try {
      await persist();
      setSaved(true);
      showToast("Draft saved");
    } catch (error) {
      fail(error);
    } finally {
      setSaving(false);
    }
  }

  async function submit(confirmFlagged = false) {
    setStage({ kind: "checking" });
    try {
      const result = await actions.submit(await persist(), CONTRIBUTION_TERMS_VERSION, confirmFlagged);
      if (!result.submitted) return setStage({ kind: "flagged", flags: result.piiCheck.flags });
      showToast("Submitted for review");
      router.push("/contribute?tab=review");
    } catch (error) {
      fail(error);
    }
  }

  /** Saves the draft, uploads the recording and returns the transcript to review. */
  async function transcribe(recording: Recording): Promise<string> {
    const draft = await persist();
    await actions.uploadAudio(draft, recording.audio, recording.durationSec);
    const result = await actions.transcribe(draft);
    if (result.status !== "ready" || !result.draftText) {
      throw new ApiError("INTERNAL", "We couldn't transcribe that recording. Record it again.", 0);
    }
    setSaved(true);
    return result.draftText;
  }

  return {
    fields,
    edit,
    saved,
    saving,
    stage,
    setStage,
    save,
    submit,
    transcribe,
    isNew: id === null,
    titleOk,
    canSubmit: titleOk && body.trim().length > 0,
  };
}
