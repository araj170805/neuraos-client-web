import type { ContributionDoc, WithId } from "@/lib/types";
import { at } from "./time";
import { fixtureUids as u } from "./users";

/** The sample doctor's case studies (sidebar in UI preview). Fictional. */

function contribution(id: string, doc: Partial<ContributionDoc> & Pick<ContributionDoc, "title" | "type" | "status">): WithId<ContributionDoc> {
  return {
    id,
    contributorUid: u.doctor,
    specialty: "Cardiology",
    text: "",
    audio: null,
    transcript: null,
    piiCheck: null,
    contributionTermsVersion: "2026-10",
    reviewerUid: null,
    reviewNote: null,
    createdAt: at("2026-10-24T17:00:00+05:30"),
    submittedAt: null,
    reviewedAt: null,
    ...doc,
  };
}

export const myContributions: WithId<ContributionDoc>[] = [
  contribution("con_af", {
    title: "Fast AF with decompensated heart failure",
    type: "text",
    status: "submitted",
    text: "71-year-old man with known LV impairment, two days of breathlessness and palpitations. AF at 148, bibasal crackles. Rate control with digoxin first because of hypotension, then cautious beta-blocker once euvolaemic. He was seen by Mr. Rao from the next bed's family, who called 98200 00000.",
    piiCheck: {
      status: "flagged",
      flags: [
        { kind: "name", excerpt: "Mr. Rao" },
        { kind: "phone", excerpt: "98200 00000" },
      ],
    },
    submittedAt: at("2026-10-25T08:00:00+05:30"),
  }),
  contribution("con_voice", {
    title: "Post-MI pericarditis, day 4",
    type: "voice",
    status: "draft",
    audio: { gcsUri: "gs://neuraos-fixtures/contributions/u_aarav/con_voice.webm", mimeType: "audio/webm", durationSec: 142 },
    transcript: {
      status: "ready",
      draftText: "Fifty-eight year old woman, day four after an inferior STEMI, new pleuritic chest pain that eases sitting forward. Friction rub, saddle ST elevation. Treated with high-dose aspirin and colchicine.",
    },
  }),
  contribution("con_hcm", {
    title: "Syncope on exertion in a young athlete",
    type: "text",
    status: "approved",
    text: "19-year-old footballer, syncope mid-sprint. Ejection systolic murmur louder on standing. Echo: asymmetric septal hypertrophy with LVOT gradient 64 mmHg.",
    piiCheck: { status: "clean", flags: [] },
    reviewerUid: u.admin,
    submittedAt: at("2026-10-24T18:00:00+05:30"),
    reviewedAt: at("2026-10-24T20:10:00+05:30"),
  }),
  contribution("con_endo", {
    title: "Infective endocarditis after dental work",
    type: "text",
    status: "needs_changes",
    text: "45-year-old man with a bicuspid aortic valve, three weeks of fevers after a dental extraction.",
    piiCheck: { status: "clean", flags: [] },
    reviewerUid: u.admin,
    reviewNote: "Add the culture result, antibiotic choice and duration, and the outcome.",
    submittedAt: at("2026-10-24T19:00:00+05:30"),
    reviewedAt: at("2026-10-25T08:30:00+05:30"),
  }),
];
