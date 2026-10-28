"use client";

import { useDocument, type Live } from "@/hooks/firestore/useDocument";
import { useProfile } from "@/hooks/account/useProfile";
import { api, uploadToTarget } from "@/lib/api/client";
import type { SubmitVerificationRequest, VerificationUploadUrlRequest } from "@/lib/contracts/verification";
import type { VerificationApplicationDoc, VerificationDocument, VerificationDocumentKind, WithId } from "@/lib/types";

export type VerificationState = Live<WithId<VerificationApplicationDoc> | null> & {
  /** Signed upload URL, then the PUT; returns the entry for `documents`. */
  upload: (kind: VerificationDocumentKind, file: File) => Promise<VerificationDocument>;
  submit: (body: SubmitVerificationRequest) => Promise<void>;
};

/** The user's latest verification application (via `users.verification.applicationId`), live. */
export function useVerification(): VerificationState {
  const profile = useProfile();
  const applicationId = profile.data?.verification.applicationId ?? null;
  const live = useDocument<VerificationApplicationDoc>(
    applicationId ? `verificationApplications/${applicationId}` : null,
  );

  return {
    ...live,
    loading: profile.loading || live.loading,
    error: profile.error ?? live.error,
    upload: async (kind, file) => {
      const target = await api.verification.uploadUrl({
        kind,
        fileName: file.name,
        mimeType: file.type as VerificationUploadUrlRequest["mimeType"],
        sizeBytes: file.size,
      });
      await uploadToTarget(target, file);
      return { kind, fileName: file.name, gcsUri: target.gcsUri };
    },
    submit: async (body) => {
      await api.verification.submit(body);
    },
  };
}
