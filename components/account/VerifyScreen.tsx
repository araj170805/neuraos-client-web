"use client";

import { useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { VerificationForm } from "@/components/account/VerificationForm";
import { VerificationStatusView } from "@/components/account/VerificationStatusView";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/toastStore";
import type { SubmitVerificationRequest } from "@/lib/contracts/verification";
import type { VerificationApplicationDoc, VerificationDocument, VerificationDocumentKind } from "@/lib/types";

type VerifyScreenProps = {
  /** Null before the first application. */
  application: VerificationApplicationDoc | null;
  defaults: { fullName: string; specialty: string };
  upload: (kind: VerificationDocumentKind, file: File) => Promise<VerificationDocument>;
  /** POST /api/verification; the live application then shows the new status. */
  onSubmit: (request: SubmitVerificationRequest) => Promise<void>;
};

/** Apply, see where the application stands, or resubmit after "needs info". */
export function VerifyScreen({ application, defaults, upload, onSubmit }: VerifyScreenProps) {
  const [editing, setEditing] = useState(application === null);

  return (
    <>
      <TopBar title="Doctor verification" subtitle="Verified doctors can contribute case studies" />
      <div className="min-h-0 flex-1 overflow-auto px-4 pt-2 pb-14 app:px-6">
        <div className="mx-auto flex max-w-form flex-col gap-7">
          {editing ? (
            <>
              <Text variant="body-lg" className="max-w-140 text-muted text-pretty">
                We check your registration with the medical council, usually within a day. Your documents are used only
                for this check.
              </Text>
              <VerificationForm
                submitLabel={application ? "Resubmit application" : "Submit application"}
                initial={{
                  fullName: application?.fullName ?? defaults.fullName,
                  phone: application?.phone ?? "",
                  specialty: application?.specialty ?? defaults.specialty,
                  institution: application?.institution ?? "",
                  registrationNumber: application?.registrationNumber ?? "",
                  councilName: application?.councilName ?? "",
                  registrationYear: application ? String(application.registrationYear) : "",
                }}
                upload={upload}
                onSubmit={async (request) => {
                  await onSubmit(request);
                  setEditing(false);
                  showToast("Application submitted");
                }}
              />
            </>
          ) : (
            application && <VerificationStatusView application={application} onUpdate={() => setEditing(true)} />
          )}
        </div>
      </div>
    </>
  );
}
