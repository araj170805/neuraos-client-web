"use client";

import { VerifyScreen } from "@/components/account/VerifyScreen";
import { myApplication } from "@/lib/fixtures/account";
import { signedInUser } from "@/lib/fixtures/users";
import type { ApplicationStatus } from "@/lib/types";

const previewStatuses: ApplicationStatus[] = ["pending", "needs_info", "rejected"];

const notes: Partial<Record<ApplicationStatus, string>> = {
  needs_info: "The ID proof is cut off at the bottom. Upload the full front side.",
  rejected: "The registration number isn't on the council register.",
};

/**
 * Client side of /verify. Static: the fixture application; `forced` (UI preview
 * ?state=none|pending|needs_info|rejected) shows the other states. At integration: useVerification().
 */
export function VerifyContainer({ forced }: { forced: string | null }) {
  const status = previewStatuses.find((s) => s === forced);
  const application =
    forced === "none"
      ? null
      : status
        ? {
            ...myApplication,
            status,
            reviewNote: notes[status] ?? null,
            reviewedAt: status === "pending" ? null : myApplication.reviewedAt,
          }
        : myApplication;

  return (
    <VerifyScreen
      key={forced ?? "fixture"}
      application={application}
      defaults={{ fullName: signedInUser.name, specialty: signedInUser.specialty ?? "" }}
    />
  );
}
