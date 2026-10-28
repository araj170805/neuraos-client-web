<div align="center">

# NeuraOS

**Medical AI chat for Indian healthcare professionals.**

Ask clinical questions, ground answers in your own documents, and work through cases together with your team.

`Next.js 16` · `React 19` · `Tailwind v4` · `Firebase` · `Gemini on Vertex AI` · `Bun`

</div>

---

## What it does

| | |
| --- | --- |
| **Chat** | Streamed medical answers from Gemini. Non-medical questions are declined; emergencies get the 108 / 112 message. |
| **Files** | Upload PDFs and images; answers cite them. |
| **Groups** | Turn any chat into a group with an invite link. Members @mention the AI or each other, and everyone sees replies live. |
| **Verification** | Doctors apply with their council registration; admins approve or reject. |
| **Contributions** | Verified doctors submit case studies by text or voice, checked for patient details before review. |
| **Admin** | Review queues, users, feature flags, spend cap and an audit log. |

## How it works

```
Browser ── API calls (Firebase ID token) ──► Next.js routes ──► Gemini · Firestore · Cloud Storage
   ▲                                                               │
   └──────────────── Firestore listeners (messages, AI tokens) ◄───┘
```

- **Clients only read.** Every write goes through an API route, so limits can't be bypassed.
- **Every chat is a group.** A solo chat is a group of one: one model, one API, one UI.
- **No socket server.** The server streams tokens into Firestore and listeners show them live.

## Quick start

```bash
bun install
cp .env.example .env.local     # values come from Dhruti
bun run dev
```

No backend yet? Add `NEXT_PUBLIC_UI_PREVIEW=true` to `.env.local` (dev only): every page renders with fixture data and no sign-in.

| Command | |
| --- | --- |
| `bun run dev` | Start the app |
| `bun run lint` | ESLint |
| `bun run typecheck` | Route types + `tsc` |

## Project layout

```
app/          routes: (marketing), (app) chat & account, admin, join, api
components/   UI, one component per file (ui/, chat/, groups/, account/, admin/)
hooks/        data hooks (read Firestore, write through lib/api)
lib/          types, limits, zod contracts, api client, firebase, server code, fixtures
styles/       fonts and the typography scale
docs/         SPEC.md (source of truth) and TASKS.md (checklists)
design/       Claude Design handoffs, reference only
```

## Team

| | Owns |
| --- | --- |
| **Dhruti** (lead) | Setup, account/admin hooks, review, release |
| **Dibyanshu** | AI chat backend, chat hooks, chat screen integration |
| **Ashish** | Uploads, groups, upload/group/account/admin integration |

Work happens in forks; PRs go into `alpha-launch` on swaindhruti/neuraos-client-web.

```bash
git clone <your fork URL> && cd neuraos-client-web
git remote add upstream https://github.com/swaindhruti/neuraos-client-web.git
git fetch upstream && git checkout -b alpha-launch upstream/alpha-launch
```

Then tell your coding agent: *"I'm &lt;name&gt;. Read AGENTS.md and docs/TASKS.md and start my next task."*

Ownership, branch names and PR rules: [`AGENTS.md`](AGENTS.md) · Spec: [`docs/SPEC.md`](docs/SPEC.md) · Tasks: [`docs/TASKS.md`](docs/TASKS.md)
