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

## Local setup with real Firebase

1. Fork [swaindhruti/neuraos-client-web](https://github.com/swaindhruti/neuraos-client-web), clone your fork, add upstream, check out `alpha-launch` from upstream, install:

   ```bash
   git clone <your fork URL> && cd neuraos-client-web
   git remote add upstream https://github.com/swaindhruti/neuraos-client-web.git
   git fetch upstream && git checkout -b alpha-launch upstream/alpha-launch
   bun install
   ```

2. Put the `.env.local` Dhruti sends in the repo root and the service account JSON in `.secrets/` (both gitignored).
3. In `.env.local`, set `GOOGLE_APPLICATION_CREDENTIALS` to the absolute path of that JSON on your machine.
4. `bun run check:setup`: all four checks pass.
5. `bun run dev`, open [localhost:3000](http://localhost:3000), sign in with Google once.
6. Make yourself admin: `bun run set-admin <your-email>`, then sign out and back in.
7. Never commit `.env.local` or `.secrets/`, and never paste the key anywhere.

Then tell your coding agent: *"I'm &lt;name&gt;. Read AGENTS.md and docs/TASKS.md and start my next task."*

Profile, verification, case studies and admin run on real data. Chat and join pages still use fixture data until their backend lands; `NEXT_PUBLIC_UI_PREVIEW=true` in `.env.local` (dev only) opens those without sign-in. Project-level setup (rules, config, indexes, deploy) is in [`docs/SETUP.md`](docs/SETUP.md).

| Command | |
| --- | --- |
| `bun run dev` | Start the app |
| `bun run lint` | ESLint |
| `bun run typecheck` | Route types + `tsc` |
| `bun run check:setup` | Check Firestore, Storage, signed URLs and Gemini |
| `bun run seed:config` | Create `config/app` |
| `bun run set-admin <email>` | Give an account the admin claim |

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
| **Ashish** | AI chat end to end (backend, hooks, chat screens), plus account and admin |
| **Dibyanshu** | Uploads and groups end to end, admin gaps, release readiness |
| **Dhruti** (lead) | Reviews every PR, verifies end to end, deploys |

Work happens in forks; PRs go into `alpha-launch` on swaindhruti/neuraos-client-web. Ownership, branch names and PR rules: [`AGENTS.md`](AGENTS.md) · Spec: [`docs/SPEC.md`](docs/SPEC.md) · Tasks: [`docs/TASKS.md`](docs/TASKS.md) · Setup: [`docs/SETUP.md`](docs/SETUP.md)
