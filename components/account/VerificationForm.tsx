"use client";

import { useState } from "react";
import { COUNCILS, SPECIALTIES } from "@/components/account/options";
import { UploadTile } from "@/components/account/UploadTile";
import type { FileChipStatus } from "@/components/chat/FileChip";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FieldRow } from "@/components/ui/FieldRow";
import { FieldSelectRow } from "@/components/ui/FieldSelectRow";
import { Notice } from "@/components/ui/Notice";
import { Panel } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Text } from "@/components/ui/Text";
import { errorMessage } from "@/lib/api/client";
import { submitVerificationRequestSchema, type SubmitVerificationRequest } from "@/lib/contracts/verification";
import type { VerificationDocument, VerificationDocumentKind } from "@/lib/types";

type Fields = Omit<SubmitVerificationRequest, "documents" | "registrationYear"> & { registrationYear: string };
type Doc = { name: string; status: FileChipStatus; uploaded: VerificationDocument | null };

type VerificationFormProps = {
  initial: Fields;
  upload: (kind: VerificationDocumentKind, file: File) => Promise<VerificationDocument>;
  onSubmit: (request: SubmitVerificationRequest) => Promise<void>;
  submitLabel: string;
};

const docs: { kind: VerificationDocumentKind; label: string; hint: string }[] = [
  { kind: "registration_certificate", label: "Registration certificate", hint: "PDF or photo, up to 10 MB" },
  { kind: "id_proof", label: "ID proof", hint: "Government ID, front side, up to 10 MB" },
];

/**
 * Doctor verification application. Validated with the API's own zod schema;
 * each document uploads as soon as it's picked (signed URL, then PUT).
 */
export function VerificationForm({ initial, upload, onSubmit, submitLabel }: VerificationFormProps) {
  const [fields, setFields] = useState(initial);
  const [files, setFiles] = useState<Partial<Record<VerificationDocumentKind, Doc>>>({});
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof Fields) => (event: { target: { value: string } }) =>
    setFields((f) => ({ ...f, [key]: event.target.value }));

  async function pick(kind: VerificationDocumentKind, file: File) {
    setFiles((f) => ({ ...f, [kind]: { name: file.name, status: "uploading", uploaded: null } }));
    const finish = (next: Doc) => setFiles((f) => (f[kind]?.name === file.name ? { ...f, [kind]: next } : f));
    try {
      finish({ name: file.name, status: "ready", uploaded: await upload(kind, file) });
    } catch (error) {
      finish({ name: file.name, status: "failed", uploaded: null });
      setErrors([errorMessage(error)]);
    }
  }

  async function submit() {
    const documents = docs.flatMap(({ kind }) => files[kind]?.uploaded ?? []);
    const result = submitVerificationRequestSchema.safeParse({
      ...fields,
      registrationYear: Number(fields.registrationYear),
      documents,
    });
    const problems = result.success ? [] : [...new Set(result.error.issues.map((i) => describe(i.path[0], i.message)))];
    if (!consent) problems.push("Confirm that the details are yours and accurate.");
    setErrors(problems);
    if (!result.success || !consent) return;
    setBusy(true);
    try {
      await onSubmit(result.data);
    } catch (error) {
      setErrors([errorMessage(error)]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-7"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <section aria-labelledby="verify-details">
        <SectionLabel id="verify-details">Your details</SectionLabel>
        <Panel divided>
          <FieldRow label="Full name, as registered" value={fields.fullName} onChange={set("fullName")} autoComplete="name" />
          <FieldRow label="Phone" value={fields.phone} onChange={set("phone")} type="tel" autoComplete="tel" inputMode="tel" />
          <FieldSelectRow label="Specialty" value={fields.specialty} onChange={set("specialty")}>
            <option value="">Choose a specialty</option>
            {SPECIALTIES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </FieldSelectRow>
          <FieldRow label="Hospital / clinic" value={fields.institution} onChange={set("institution")} autoComplete="organization" />
          <FieldRow label="Registration number" value={fields.registrationNumber} onChange={set("registrationNumber")} />
          <FieldSelectRow label="Medical council" value={fields.councilName} onChange={set("councilName")}>
            <option value="">Choose a council</option>
            {COUNCILS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </FieldSelectRow>
          <FieldRow
            label="Year of registration"
            value={fields.registrationYear}
            onChange={set("registrationYear")}
            inputMode="numeric"
            maxLength={4}
          />
        </Panel>
      </section>

      <section aria-labelledby="verify-documents">
        <SectionLabel id="verify-documents">Documents</SectionLabel>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-3.5">
          {docs.map((doc) => (
            <UploadTile
              key={doc.kind}
              label={doc.label}
              hint={doc.hint}
              file={files[doc.kind] ?? null}
              onPick={(file) => pick(doc.kind, file)}
              onRemove={() => setFiles((f) => ({ ...f, [doc.kind]: undefined }))}
            />
          ))}
        </div>
      </section>

      <Checkbox checked={consent} onChange={(event) => setConsent(event.target.checked)}>
        <Text as="span" variant="body" className="text-ink-soft">
          These details are mine and accurate. NeuraOS checks them against the medical council register and keeps the
          documents only for verification.
        </Text>
      </Checkbox>

      {errors.length > 0 && (
        <div role="alert">
          <Notice tone="warning">
            <ul className="flex flex-col gap-1">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Notice>
        </div>
      )}

      <Button look="app-accent-lg" type="submit" className="self-end" disabled={busy}>
        {busy ? "Submitting…" : submitLabel}
      </Button>
    </form>
  );
}

const labels: Record<string, string> = {
  fullName: "Full name",
  phone: "Phone",
  specialty: "Specialty",
  institution: "Hospital / clinic",
  registrationNumber: "Registration number",
  councilName: "Medical council",
  registrationYear: "Year of registration",
};

/** "Phone: check this field" style messages; documents keep the schema's own message. */
function describe(field: PropertyKey | undefined, message: string): string {
  if (field === "documents") return message.startsWith("Upload") ? message : "Upload a registration certificate and an ID proof.";
  const label = typeof field === "string" ? labels[field] : undefined;
  return label ? `${label}: add a valid value.` : message;
}
