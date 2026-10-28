"use client";

import { api, uploadToTarget } from "@/lib/api/client";
import type {
  AudioUploadUrlRequest,
  CreateContributionRequest,
  SubmitContributionResponse,
  TranscribeResponse,
  UpdateContributionRequest,
} from "@/lib/contracts/contributions";

export type ContributionActions = {
  /** Creates a draft; returns its id. */
  create: (body: CreateContributionRequest) => Promise<string>;
  update: (id: string, body: UpdateContributionRequest) => Promise<void>;
  /** Signed upload URL for the recording, then the PUT. */
  uploadAudio: (id: string, audio: Blob, durationSec: number) => Promise<void>;
  transcribe: (id: string) => Promise<TranscribeResponse>;
  /** Runs the PII check; `submitted` is false when flags came back and `confirmFlagged` was false. */
  submit: (id: string, termsVersion: string, confirmFlagged: boolean) => Promise<SubmitContributionResponse>;
};

/** Writes for contributions (all through the API). */
export function useContributionActions(): ContributionActions {
  return {
    create: async (body) => (await api.contributions.create(body)).contributionId,
    update: async (id, body) => {
      await api.contributions.update(id, body);
    },
    uploadAudio: async (id, audio, durationSec) => {
      const target = await api.contributions.audioUrl(id, {
        mimeType: audio.type.split(";")[0] as AudioUploadUrlRequest["mimeType"],
        sizeBytes: audio.size,
        durationSec: Math.max(1, Math.round(durationSec)),
      });
      await uploadToTarget(target, audio);
    },
    transcribe: (id) => api.contributions.transcribe(id),
    submit: (id, termsVersion, confirmFlagged) =>
      api.contributions.submit(id, { contributionTermsVersion: termsVersion, confirmFlagged }),
  };
}
