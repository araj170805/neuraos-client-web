"use client";

import { useState } from "react";
import { duration } from "@/components/account/dates";
import { RecordKey } from "@/components/account/RecordKey";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/Panel";
import { Spinner } from "@/components/ui/Spinner";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/toastStore";
import { useVoiceRecorder, type Recording } from "@/hooks/account/useVoiceRecorder";
import { errorMessage } from "@/lib/api/client";
import { MAX_VOICE_SECONDS } from "@/lib/limits";

type VoiceRecorderProps = {
  /** Transcript to review; null until one exists. */
  transcript: string | null;
  onTranscript: (text: string) => void;
  /** Saves the draft, uploads the recording and returns its transcript. */
  transcribe: (recording: Recording) => Promise<string>;
  /** Why recording can't start yet (shown as a toast), or null. */
  blockedReason: string | null;
};

/**
 * Talk it through: record (max MAX_VOICE_SECONDS), then review and edit the
 * transcript before submitting.
 */
export function VoiceRecorder({ transcript, onTranscript, transcribe, blockedReason }: VoiceRecorderProps) {
  const [view, setView] = useState<"record" | "review">(transcript === null ? "record" : "review");
  const [transcribing, setTranscribing] = useState(false);
  const recorder = useVoiceRecorder(async (recording) => {
    setTranscribing(true);
    try {
      onTranscript(await transcribe(recording));
      setView("review");
    } catch (error) {
      showToast(errorMessage(error));
    } finally {
      setTranscribing(false);
    }
  });
  const recording = recorder.status === "recording";

  if (view === "review" && transcript !== null) {
    return (
      <Panel size="lg" className="flex min-h-0 flex-1 flex-col gap-3.5 px-5.5 pt-4.5 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text as="h2" variant="badge" className="text-muted">
            Transcript · edit before you submit
          </Text>
          <Button look="app-light-xs" onClick={() => setView("record")}>
            <Icon name="mic" size={14} />
            Record again
          </Button>
        </div>
        <Text
          as="textarea"
          variant="transcript"
          aria-label="Transcript"
          value={transcript}
          onChange={(event) => onTranscript(event.target.value)}
          className="min-h-40 flex-1 resize-none bg-transparent text-ink outline-none"
        />
      </Panel>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 rounded-panel-lg border border-ink/8 bg-paper px-6 py-10 text-center shadow-card">
      <Text variant="body-lg" className="max-w-120 text-muted text-pretty">
        {transcribing
          ? "Turning your recording into text. You can edit it next."
          : "Talk through the whole case: the patient, symptoms, findings, medication and why, outcome and aftercare. Up to 10 minutes."}
      </Text>
      {transcribing ? (
        <Text role="status" variant="body" className="flex h-26 items-center gap-2.5 text-muted">
          <Spinner />
          Transcribing…
        </Text>
      ) : (
        <RecordKey
          recording={recording}
          onClick={() => {
            if (recording) return recorder.stop();
            if (blockedReason) return showToast(blockedReason);
            void recorder.start();
          }}
        />
      )}
      {recorder.error ? (
        <Text role="alert" variant="body-sm" className="text-danger-text">
          {recorder.error}
        </Text>
      ) : (
        <Text variant="mono-sm" className="text-muted" aria-live="polite">
          {recording
            ? `Recording · ${duration(recorder.seconds)} / ${duration(MAX_VOICE_SECONDS)}`
            : transcribing
              ? ""
              : "Tap to start recording"}
        </Text>
      )}
    </div>
  );
}
