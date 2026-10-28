# NeuraOS MVP — Tasks

Split from `docs/SPEC.md`, in build order. **Alpha deploy from `swaindhruti/neuraos-client-web` `alpha-launch` once C1, C2, C4 and integration pass local testing. Groups ship behind `groupsEnabled: false` until C3 is tested.**
One task per PR; tick its box in that PR. Ownership and the PR workflow are in `AGENTS.md` ("Team").

**How the halves meet:** the UI is built static against fixtures in `lib/fixtures/`, typed with `lib/types.ts` and `lib/contracts`. Hooks return those same types. At integration, each page swaps its fixture for the hook, with no type changes.

**What each hook must feed:** the static UI already takes these props, so return exactly these shapes (types from `lib/types.ts`, `WithId<T>` for documents, contracts for admin lists):

| Hook | Replaces fixture in | UI that consumes it |
| --- | --- | --- |
| `useChats` | `app/(app)/layout.tsx` (`chats`) | `ChatSidebar` → `chats: WithId<ChatDoc>[]` |
| `useChat`, `useMessages`, `useFiles` | `app/(app)/chat/[chatId]/page.tsx` | `ChatScreen` → `chat`, `messages: WithId<MessageDoc>[]`, `files: WithId<FileDoc>[]` |
| `useSendMessage`, `useRetry`, `useFeedback`, `useUpload` | static stand-ins in `ChatScreen`, `usePendingUploads` | `Composer` `onSend(ComposerDraft)`, `AiMessage` `onRetry` / `onRate` |
| `useGroupActions`, `useJoin` | `GroupDialogs`, `JoinScreen` | convert / invite / remove / leave / join callbacks |
| `useProfile`, `useReferral` | `signedInUser` | `ProfileScreen` → `user: UserDoc` |
| `useVerification` | `myApplication` | `VerifyScreen` → `application: VerificationApplicationDoc \| null` |
| `useContributions`, `useContribution` | `myContributions` | `/contribute` list, `ContributionEditor`, `ContributionView` |
| `useVoiceRecorder` | timer in `VoiceRecorder` | `VoiceRecorder` `onTranscript(text)` |
| `useApplications`, `useAdminContributions`, `useAdminUsers`, `useAuditLogs`, `useConfig` | `lib/fixtures/admin.ts` | admin tables and review pages (`AdminApplication`, `AdminContribution`, `AdminUser`, `AdminAuditLog`, `AppConfig`) |

Run the static pages with `NEXT_PUBLIC_UI_PREVIEW=true` in `.env.local` (dev only, no sign-in) to see what each hook feeds.

**If a day slips,** cut in this order: voice contributions, reply quoting, member removal by owner, the file selector (summaries only), group chat (flag off). Never cut guardrails, limits, rules or the spend cap.

## Already on alpha-launch

- [x] Route groups, placeholder pages, `(app)` / admin / sign-in layouts, `AuthProvider` + `useAuth`
- [x] `lib/types.ts`, `lib/limits.ts`, `lib/contracts/*`, `lib/api/client.ts`
- [x] `lib/firebase/client.ts` + `admin.ts`, `lib/server/ai/*` (Vertex: guardrail, streaming answer, extraction, file selector, transcription, PII check, system prompt, fixed replies)
- [x] `lib/server/http/route.ts` + `errors.ts` (token, App Check monitor-only, admin claim, zod, error mapping, request log); example `app/api/health`
- [x] `firestore.rules`, `storage.rules`
- [x] U1–U5 static UI (design system, chat panel, groups, account pages, admin)
- [x] Ashish's backend: onboarding, profile, verification, contributions, admin (incl. downloads), scripts, indexes, firebase.json
- [x] Real Firebase project `neuraos` connected (`.env.local`, key in `.secrets/`), `apphosting.yaml`, `bun run check:setup` (setup steps: `docs/SETUP.md`)

## Dhruti — setup, A1, review, release

- [ ] Setup in `docs/SETUP.md` (config doc, rules published), `bun run check:setup` passes
- [ ] **A1** `hooks/account`: `useProfile`, `useReferral`, `useVerification`, `useContributions`, `useContribution`, `useVoiceRecorder` (MediaRecorder, `MAX_VOICE_SECONDS`)
- [ ] **A1** `hooks/admin`: `useApplications`, `useAdminContributions`, `useAdminUsers`, `useAuditLogs`, `useConfig`
- [ ] **R** Review all server code (Ashish's merged routes now; C1–C3 as PRs land), test each against the real project
- [ ] Final local test (SPEC.md section 1 and 16), deploy (`docs/SETUP.md`), live test

## Dibyanshu — AI chat (critical path, do C1 first)

All chat routes live under `app/api/chats/[chatId]/` (same segment name as Ashish's routes).

- [ ] **C1** `POST /api/chats`
- [ ] **C1** `POST /api/chats/[chatId]/messages`: membership, per-minute and daily limits, `aiEnabled` and daily spend cap, `aiInFlight` slot transaction, guardrail replies (decline / 108–112 / injection), context builder, streaming to Firestore every `STREAM_FLUSH_MS`, finish/error (usage, spend shards, clear slot in `finally`), referral qualification on first reply. Use `lib/server/ai/*`.
- [ ] **C1** Retry and feedback routes
- [ ] **C1** Shared PR: `guardrailLabel` on AI `MessageDoc` (`lib/types.ts`), so the UI tells emergency from declined
- [ ] **C4** `hooks/chat`: `useChats`, `useChat`, `useMessages`, `useFiles` (onSnapshot), `useSendMessage`, `useRetry`, `useFeedback`
- [ ] **I-chat** Integrate: `app/(app)/layout.tsx` (chat list), `app/(app)/chat/**`, chat screen, messages, composer send, retry, feedback (swap fixtures for the hooks above)

## Ashish — uploads, groups, account and admin integration

All chat routes live under `app/api/chats/[chatId]/` (same segment name as Dibyanshu's routes).

- [ ] **C2** Uploads: `POST /api/chats/[chatId]/files/upload-url`, `.../files/[fileId]/complete` (verify object, extraction), `DELETE .../files/[fileId]`, `GET /api/files/[fileId]/url`
- [ ] **C2** `hooks/chat/useUpload.ts`
- [ ] **C3** Groups: `convert` (shared history or fork), invite create/rotate/revoke, `POST /api/join/[token]` (`MAX_MEMBERS` transaction), `GET /api/join/[token]` preview (contract in `lib/contracts/groups.ts`), `leave`, remove member, system messages
- [ ] **C3** `hooks/chat/useGroupActions.ts`, `hooks/chat/useJoin.ts`
- [ ] **I-files+groups** Integrate: upload UI (`AttachButton`, `AttachmentChips`, `CaseFiles`, `FileChip`, `usePendingUploads`), `components/groups/**`, `app/join/**`
- [ ] **I-account+admin** (after Dhruti's A1 hooks land) Integrate: sign-in calls onboarding, profile, verify, contribute (real uploads and voice), admin pages
