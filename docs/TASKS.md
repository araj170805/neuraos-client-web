# NeuraOS MVP — Tasks

Split from `docs/SPEC.md`, in build order. **Alpha deploy from `swaindhruti/neuraos-client-web` `alpha-launch` once C1, C2, C4 and their integration pass local testing. Groups ship behind `groupsEnabled: false` until C3 is tested.**
One task per PR; tick its box in that PR, and only in your own section. Ownership and the PR workflow are in `AGENTS.md` ("Team").

**Done means end to end:** route + hook + UI wired (no fixtures) + clicked through with `bun run dev` against the real Firebase project (setup: README "Local setup with real Firebase").

**How the halves meet:** the UI was built against fixtures in `lib/fixtures/`, typed with `lib/types.ts` and `lib/contracts`. Hooks return those same types. Each page reads its data in a client `*Container.tsx` (see `components/account/*Container.tsx` and `components/admin/*Container.tsx`); integrating a page means swapping the fixture in its container for the hook, with no type changes.

**What each hook must feed:** the static UI already takes these props, so return exactly these shapes (types from `lib/types.ts`, `WithId<T>` for documents, contracts for admin lists):

| Hook | Replaces fixture in | UI that consumes it |
| --- | --- | --- |
| `useChats` | `components/chat/ChatSidebarContainer.tsx` (`chats`) | `ChatSidebar` → `chats: WithId<ChatDoc>[]` |
| `useChat`, `useMessages`, `useFiles` | `components/chat/ChatScreenContainer.tsx` | `ChatScreen` → `chat`, `messages: WithId<MessageDoc>[]`, `files: WithId<FileDoc>[]` |
| `useSendMessage`, `useRetry`, `useFeedback`, `useUpload` | static stand-ins in `ChatScreen`, `usePendingUploads` | `Composer` `onSend(ComposerDraft)`, `AiMessage` `onRetry` / `onRate` |
| `useGroupActions`, `useJoin` | `GroupDialogs`, `app/join/[token]/page.tsx` | convert / invite / remove / leave / join callbacks, `JoinScreen` |
| Account and admin hooks | done (A1, P3, P4) | live on profile, verify, contribute and admin pages |

The chat and join pages can still be opened without sign-in with `NEXT_PUBLIC_UI_PREVIEW=true` in `.env.local` (dev only) to see what each hook feeds. Real pages must not import `lib/fixtures` once integrated.

**If a day slips,** cut in this order: voice contributions, reply quoting, member removal by owner, the file selector (summaries only), group chat (flag off). Never cut guardrails, limits, rules or the spend cap.

## Done on alpha-launch

- [x] Route groups, layouts, `AuthProvider` + `useAuth`; `lib/types.ts`, `lib/limits.ts`, `lib/contracts/*`, `lib/api/client.ts`
- [x] `lib/firebase/client.ts` + `admin.ts` (named database `neuraos`), `lib/server/ai/*` (Vertex: guardrail, streaming answer, extraction, file selector, transcription, PII check, system prompt, fixed replies)
- [x] `lib/server/http/route.ts` + `errors.ts`; `firestore.rules`, `storage.rules`
- [x] U1–U5 UI (design system, chat panel, groups, account pages, admin)
- [x] Real Firebase project connected: `apphosting.yaml`, `bun run check:setup` / `seed:config` / `set-admin`, `docs/SETUP.md`
- [x] Sign-in and onboarding: landing "Try it" → Google sign-in → `POST /api/onboarding` (user doc, referral code, referral cookie); sign out
- [x] **A1** hooks: `hooks/account/*` (`useProfile`, `useReferral`, `useVerification`, `useContributions`, `useContribution`, `useContributionActions`, `useVoiceRecorder`), `hooks/admin/*` (`useApplications`, `useAdminContributions`, `useAdminUsers`, `useAuditLogs`, `useConfig`), shared `hooks/firestore/{useDocument,useCollection}`
- [x] Profile: live user doc, save (`PATCH /api/profile`), referral card
- [x] Verification: document uploads (signed URL), submit and resubmit, live status
- [x] Contributions incl. voice: drafts, record → upload → transcribe, submit through the server PII check, list and read-only view
- [x] Admin panel: overview, application and contribution queues and reviews (signed document and audio links), decisions with audit log, users, settings, audit log

## Ashish — AI chat (main track; C1 first, it is the critical path)

All chat API routes use the segment `app/api/chats/[chatId]/`.

- [ ] **C1** `POST /api/chats`
- [ ] **C1** `POST /api/chats/[chatId]/messages`: membership, per-minute and daily limits, `aiEnabled` and daily spend cap, `aiInFlight` slot transaction, guardrail replies (decline / 108–112 / injection), context builder, streaming to Firestore every `STREAM_FLUSH_MS`, finish and error handling (usage and spend shards, clear the slot in `finally`), referral qualification on first reply. Use `lib/server/ai/*`.
- [ ] **C1** Retry and feedback routes
- [ ] **C1** Shared PR: `guardrailLabel` on AI `MessageDoc` (`lib/types.ts`), so the UI tells emergency from declined without reading the text
- [ ] **C4** `hooks/chat`: `useChats`, `useChat`, `useMessages`, `useFiles`, `useSendMessage`, `useRetry`, `useFeedback` (build on `hooks/firestore/*`)
- [ ] **Chat integration**: chat list (`ChatSidebarContainer`), `app/(app)/chat/**`, new chat, `ChatScreen`, message rows (streaming, error/retry, declined, emergency, system), composer send, @mentions, reply-to, feedback, limit and error toasts. Remove chat fixtures from the real pages.
- [ ] **E2E** SPEC.md section 16 "Solo chat" checklist with real Gemini

## Dibyanshu — uploads, groups, gaps, release readiness

- [ ] **C2** Uploads: `POST /api/chats/[chatId]/files/upload-url`, `POST .../files/[fileId]/complete` (verify the object, extraction), `DELETE .../files/[fileId]`, `GET /api/files/[fileId]/url`; `hooks/chat/useUpload.ts`
- [ ] **Upload integration**: `AttachButton`, `AttachmentChips`, `CaseFiles`, `FileChip`, `usePendingUploads`. `ChatScreen` and `Composer` belong to Ashish: agree with him first and wire uploads in a separate small PR after his chat integration lands.
- [ ] **C3** Groups: `convert` (shared history or fork), invite create/rotate/revoke, `POST /api/join/[token]` (`MAX_MEMBERS` transaction), `GET /api/join/[token]` preview (contract in `lib/contracts/groups.ts`), `leave`, remove member, system messages; `hooks/chat/useGroupActions.ts`, `hooks/chat/useJoin.ts`
- [ ] **Groups integration**: `components/groups/**`, `app/join/**`, header group actions. Test with 2–3 accounts, then set `config/app.groupsEnabled` to `true`.
- [ ] **Gap** `GET /api/admin/spend` (sum of today's spend shards) wired into the admin `SpendCard` and Settings (both show "—" today)
- [ ] **Gap** Admin route to set a user's `canContribute`, wired to the switch in the user drawer (read-only today)
- [ ] **Gap** Referral names on the profile, if cheap
- [ ] **Release readiness**: `bun run build` passes; no `lib/fixtures` imports in real pages (preview mode only); `firestore.indexes.json` lists every index the app's queries need; `apphosting.yaml` up to date
- [ ] **E2E** SPEC.md section 16 "Uploads" and "Groups" checklists

## Dhruti — review, verify, deploy

- [ ] Review and merge every PR into `alpha-launch`
- [ ] Final end-to-end verification of SPEC.md section 1 (launch criteria) on the real project
- [ ] Deploy per `docs/SETUP.md`, then repeat the launch criteria on the live URL
