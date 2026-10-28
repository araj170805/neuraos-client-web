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

Split (from 28 Oct): Dhruti does setup, account/admin hooks (A1), review and release. Dibyanshu builds the AI chat (C1), chat hooks (C4) and integrates the chat screens. Ashish builds uploads (C2) and groups (C3) and integrates the upload UI, group UI, account and admin pages.

## Ownership
- **Dhruti (setup, A1, review):** hooks/account/**, hooks/admin/**, hooks/useAuth.ts, lib/server/http/**, lib/server/env.ts, lib/firebase/**, lib/api/**, lib/fixtures/**, app/(marketing)/**, components/ui/**, styles/**, app/globals.css, design/**, scripts/**, apphosting.yaml, firebase.json, .firebaserc, package.json, bun.lock, AGENTS.md, docs/**
- **Dibyanshu (AI chat):** app/api/chats/route.ts, app/api/chats/[chatId]/messages/**, lib/server/chat/**, lib/server/ai/**, lib/contracts/{chats,messages}.ts, hooks/chat/** except the three files Ashish owns. Integration: app/(app)/layout.tsx, app/(app)/chat/**, components/chat/** except the upload files below.
- **Ashish (uploads, groups, account/admin integration):** app/api/chats/[chatId]/files/**, app/api/chats/[chatId]/{convert,invite,leave,members}/**, app/api/files/**, app/api/join/**, lib/server/files/**, lib/server/groups/**, lib/contracts/{files,groups}.ts, hooks/chat/{useUpload,useGroupActions,useJoin}.ts, and his merged routes (app/api/{onboarding,profile,verification,contributions,admin}/**, lib/server/{account,admin}/**, lib/contracts/{onboarding,verification,contributions,admin}.ts). Integration: components/chat/{AttachButton,AttachmentChips,CaseFiles,FileChip,usePendingUploads,fileFormat}.*, components/groups/**, components/account/**, components/admin/**, app/join/**, app/sign-in/**, app/(app)/{profile,verify,contribute}/**, app/admin/**.
- **Integration owners may edit the page and component files listed for their area.** `ChatScreen.tsx` and `Composer.tsx` belong to Dibyanshu; Ashish wires uploads into them only after telling him, in a separate small PR.
- **Shared, change by PR with a note:** lib/types.ts (additive changes only), lib/limits.ts, lib/contracts/{common,errors}.ts, firestore.rules, storage.rules, firestore.indexes.json.
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
- Static pages read `lib/fixtures/`; set `NEXT_PUBLIC_UI_PREVIEW=true` in `.env.local` to open them without sign-in (dev only). `docs/TASKS.md` maps each hook to the UI props it must feed.
- Need a package? Ask Dhruti.
- Never commit .env files or keys.
- Fictional data only (seeds, fixtures, tests), never real patient details. Never log message text, transcripts, file contents or contribution text.

## Git workflow
- `origin` = your own fork; `upstream` = swaindhruti/neuraos-client-web.
- Start each task: `git fetch upstream && git checkout -b feat/<name>-<task> upstream/alpha-launch`
- Before pushing: `bun run lint`, `bun run typecheck`, `git fetch upstream`, `git rebase upstream/alpha-launch`
- Push to your fork: `git push -u origin feat/<name>-<task>`
- Open a PR from your fork's branch into swaindhruti/neuraos-client-web : `alpha-launch`. Title "[name] what it does". One task per PR, keep it small.
- Only touch files you own. Shared files change only in their own PR with a note; a PR that edits someone else's files or package.json gets sent back.
- Need a new field, route, limit or package? Ask Dhruti.
- Agents never push or open PRs on their own; the person does.
