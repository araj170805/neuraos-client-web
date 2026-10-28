<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project rules

## Stack
- Next.js App Router, TypeScript, Bun as the package manager (never npm, yarn or pnpm, never another lockfile). Check package.json for exact versions and whether Tailwind is installed.
- Follow the Next.js block above: read the relevant guide in node_modules/next/dist/docs/ before using any Next.js API.

## Structure (inside src/ if it exists, otherwise at the repo root)
- app/: routes, layout, globals.css (design tokens live here)
- components/ui/: reusable primitives (Text, Button, Container, Section, Link)
- components/sections/: one file per page section, composed in app/page.tsx
- styles/fonts.ts: the only place fonts are loaded (next/font)
- styles/typography.ts: the only place text styles are defined
- hooks/, lib/: shared hooks, helpers, constants

## Code rules
- Server Components by default. Use 'use client' only for state, effects or browser APIs, on the smallest leaf component.
- One component per file, PascalCase, named export, typed props, under 200 lines.
- All text is rendered through <Text variant="..."> from styles/typography.ts. No font-size, weight, line-height, letter-spacing or font-family anywhere else. Need a new style? Add a variant first.
- Variants use fluid sizes with clamp() and come from the design's real type scale.
- Colors, spacing, radii and durations are tokens in globals.css. No hardcoded hex values in components.
- Build mobile-first and responsive.
- Images use next/image (explicit size, or fill + sizes). `priority` only on the LCP image.
- Semantic HTML, one h1 per page, alt text, visible focus styles, respect prefers-reduced-motion.
- No `any`, no @ts-ignore, no dead code.

# Team

`docs/SPEC.md` is the source of truth; `docs/TASKS.md` is each person's checklist. Work happens in forks; PRs go into `alpha-launch` on swaindhruti/neuraos-client-web (the company repo is not used for the alpha).

Split (from 28 Oct, second re-split): Ashish builds the AI chat end to end (C1 backend, C4 hooks, chat integration). Dibyanshu builds uploads (C2) and groups (C3) end to end, closes the admin gaps and owns release readiness. Dhruti only reviews PRs, verifies end to end and deploys. Account and admin are already live on real data.

## Ownership
- **Ashish (AI chat, account, admin):** app/api/chats/route.ts, app/api/chats/[chatId]/messages/**, lib/server/chat/**, lib/server/ai/**, lib/contracts/{chats,messages}.ts, hooks/chat/** except useUpload, useGroupActions and useJoin; app/(app)/layout.tsx, app/(app)/chat/**, components/chat/** except the upload files below. Plus account and admin: app/api/{onboarding,profile,verification,contributions,admin}/** (except the two admin routes Dibyanshu adds), lib/server/{account,admin}/**, lib/contracts/{onboarding,verification,contributions,admin}.ts, hooks/account/**, hooks/admin/**, components/account/**, components/admin/**, app/(app)/{profile,verify,contribute}/**, app/admin/**, app/sign-in/**.
- **Dibyanshu (uploads, groups, gaps, release readiness):** app/api/chats/[chatId]/{files,convert,invite,leave,members}/**, app/api/files/**, app/api/join/**, app/api/admin/spend/**, the new admin route that sets a user's canContribute, lib/server/{files,groups}/**, lib/contracts/{files,groups}.ts, hooks/chat/{useUpload,useGroupActions,useJoin}.ts, components/chat/{AttachButton,AttachmentChips,CaseFiles,FileChip,usePendingUploads,fileFormat}.*, components/groups/**, app/join/**, firestore.indexes.json, apphosting.yaml.
- **Cross-area edits:** `ChatScreen.tsx` and `Composer.tsx` belong to Ashish; Dibyanshu wires uploads and group actions into them only after agreeing with him, in a separate small PR after his chat integration lands. For the admin gaps, Dibyanshu adds the contracts to lib/contracts/admin.ts and wires SpendCard, Settings and the user drawer in small PRs with a note to Ashish.
- **Dhruti (review, verify, deploy):** AGENTS.md, docs/** (each person ticks only their own section of TASKS.md), scripts/**, firebase.json, .firebaserc, app/(marketing)/**, app/globals.css, design/**.
- **Shared, small PR with a note only:** lib/types.ts (additive), lib/limits.ts, lib/contracts/{common,errors}.ts, lib/api/**, lib/firebase/**, lib/server/http/**, hooks/firestore/**, components/ui/**, styles/**, lib/fixtures/** (removing fixtures your area no longer uses is fine), firestore.rules, storage.rules, package.json, bun.lock.
- All chat API routes use the dynamic segment `[chatId]` (Next.js needs one name per level).
- You may import from another person's files, but don't edit them.

## Design handoffs
- `design/site/` (landing), `design/chat/` (web chat panel, incl. sign-in, profile, verify, contribute if present), `design/groups/` (join and group UI), `design/admin/` (admin panel).
- Reference only: rebuild as React components, never copy their HTML, CSS or JS. Excluded from ESLint, tsconfig and Tailwind scanning.

## Rules
- Every route uses `lib/server/http/route.ts` and matches its contract in `lib/contracts` exactly (body, query and response schemas, error codes).
- Throw `ApiError` from `lib/server/http/errors.ts` for expected failures; the wrapper sends `{ error: { code, message } }` with the right status.
- Hooks return data typed with `lib/types.ts` and `lib/contracts`; UI components take those same types as props. This is how the UI and backend meet at integration.
- Hooks read Firestore with `lib/firebase/client.ts` and never write to it; writes go through `lib/api/client.ts`. The user comes from `useAuth()`.
- Pages read data in a small client container (`*Container.tsx`) that calls the hooks and passes their results to the screen. Account and admin pages are live; chat and join pages still read `lib/fixtures/` (open them without sign-in with `NEXT_PUBLIC_UI_PREVIEW=true`, dev only) until their hooks land. `docs/TASKS.md` maps each hook to the UI props it must feed.
- Need a package? Add it in a small shared PR with a note; Dhruti reviews it.
- Never commit .env files or keys.
- Fictional data only (seeds, fixtures, tests), never real patient details. Never log message text, transcripts, file contents or contribution text.

## Git workflow
- `origin` = your own fork; `upstream` = swaindhruti/neuraos-client-web.
- Start each task: `git fetch upstream && git checkout -b feat/<name>-<task> upstream/alpha-launch`
- Before pushing: `bun run lint`, `bun run typecheck`, `git fetch upstream`, `git rebase upstream/alpha-launch`
- Push to your fork: `git push -u origin feat/<name>-<task>`
- Open a PR from your fork's branch into swaindhruti/neuraos-client-web : `alpha-launch`. Title "[name] what it does". One task per PR, keep it small.
- Only touch files you own. Shared files change only in their own small PR with a note; a PR that edits someone else's files, or a shared file without a note, gets sent back.
- Need a new field, route, limit or package? Open a small PR with a note; Dhruti reviews it.
- Agents never push or open PRs on their own; the person does. Dhruti reviews every PR.
