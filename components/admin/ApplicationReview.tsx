"use client";

import { useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { applicationPill, isoDayTime } from "@/components/admin/adminLabels";
import { DecidedPanel } from "@/components/admin/DecidedPanel";
import { DecisionPanel } from "@/components/admin/DecisionPanel";
import { DocumentCard } from "@/components/admin/DocumentCard";
import { DocumentLightbox } from "@/components/admin/DocumentLightbox";
import { HistoryPanel } from "@/components/admin/HistoryPanel";
import { reviewHistory } from "@/components/admin/reviewHistory";
import { SignedDocument } from "@/components/admin/SignedDocument";
import { Avatar } from "@/components/ui/Avatar";
import { KeyValueList } from "@/components/ui/KeyValueList";
import { Panel } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/toastStore";
import { errorMessage } from "@/lib/api/client";
import type { AdminApplication, ApplicationDecisionRequest } from "@/lib/contracts/admin";
import type { VerificationDocumentKind } from "@/lib/types";

type Doc = { kind: VerificationDocumentKind; fileName: string };

type ApplicationReviewProps = {
  application: AdminApplication;
  email: string;
  reviewer: string;
  /** POST /api/admin/applications/:id/decision. */
  onDecide: (body: ApplicationDecisionRequest) => Promise<void>;
  /** Signed URL for one of the applicant's documents. */
  documentUrl: (doc: Doc) => Promise<string>;
};

const kindLabel: Record<VerificationDocumentKind, string> = {
  registration_certificate: "Registration certificate",
  id_proof: "ID proof",
};

const fileType = (name: string) => name.split(".").pop()?.toUpperCase() ?? "File";

/** Doctor verification review (design "Application review"): details, the uploaded documents, the decision. */
export function ApplicationReview({ application: a, email, reviewer, onDecide, documentUrl }: ApplicationReviewProps) {
  const [viewer, setViewer] = useState<Doc | null>(null);
  const pill = applicationPill[a.status];
  const open = a.status === "pending";

  return (
    <>
      <TopBar title={a.fullName} subtitle={`Application · ${pill.label}`} backHref="/admin/applications" />
      <div className="min-h-0 flex-1 overflow-auto px-4 pt-2 pb-14 app:px-7">
        <div className="mx-auto flex max-w-admin flex-wrap items-start gap-6">
          <div className="flex min-w-0 flex-[3_1_33.75rem] flex-col gap-5.5">
            <Panel size="lg" className="flex flex-wrap items-center gap-4 p-5.5">
              <Avatar name={a.fullName} size="xl" />
              <div className="min-w-50 flex-1">
                <Text as="h2" variant="profile-name">
                  {a.fullName}
                </Text>
                <Text variant="body" className="mt-1.5 text-muted">
                  {a.specialty} · {a.institution}
                </Text>
              </div>
              <StatusPill tone={pill.tone} size="md">
                {pill.label}
              </StatusPill>
            </Panel>

            <section aria-labelledby="applicant-details">
              <SectionLabel id="applicant-details">Applicant details</SectionLabel>
              <Panel className="px-5 py-1">
                <KeyValueList
                  layout="stacked"
                  items={[
                    { label: "Full name", value: a.fullName },
                    { label: "Email", value: email },
                    { label: "Phone", value: a.phone },
                    { label: "Specialty", value: a.specialty },
                    { label: "Registration number", value: a.registrationNumber },
                    { label: "Medical council", value: a.councilName },
                    { label: "Year of registration", value: String(a.registrationYear) },
                    { label: "Institution", value: a.institution },
                    { label: "Submitted", value: isoDayTime(a.submittedAt) },
                  ]}
                />
              </Panel>
            </section>

            <section aria-labelledby="documents">
              <SectionLabel id="documents">Documents</SectionLabel>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16.875rem),1fr))] gap-3.5">
                {a.documents.map((doc) => (
                  <DocumentCard key={doc.fileName} title={kindLabel[doc.kind]} meta={`${fileType(doc.fileName)} · ${doc.fileName}`} onOpen={() => setViewer(doc)}>
                    <SignedDocument fileName={doc.fileName} load={() => documentUrl(doc)} size="card" />
                  </DocumentCard>
                ))}
              </div>
            </section>
          </div>

          <div className="flex min-w-0 flex-[1_1_20rem] flex-col gap-5.5 app:sticky app:top-0">
            {open ? (
              <DecisionPanel
                kind="application"
                subject={a.fullName}
                person={a.fullName}
                onDecide={async (status, note) => {
                  if (status === "needs_changes") return;
                  try {
                    await onDecide({ decision: status, note });
                    showToast(`${a.fullName}: ${applicationPill[status].label}`);
                  } catch (error) {
                    showToast(errorMessage(error));
                  }
                }}
              />
            ) : (
              <DecidedPanel status={a.status} reviewer={reviewer} reviewedAt={a.reviewedAt} note={a.reviewNote} />
            )}
            <HistoryPanel entries={reviewHistory(a, a.fullName, reviewer)} />
          </div>
        </div>
      </div>
      <DocumentLightbox
        open={viewer !== null}
        onClose={() => setViewer(null)}
        title={viewer ? kindLabel[viewer.kind] : ""}
        subtitle={a.fullName}
      >
        {viewer && <SignedDocument fileName={viewer.fileName} load={() => documentUrl(viewer)} size="full" />}
      </DocumentLightbox>
    </>
  );
}
