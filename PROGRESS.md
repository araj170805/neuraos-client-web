# NeuraOS site — progress

Source design: Claude Design project "NeuraOS AI app mockups" → `NeuraOS Site.dc.html`
(saved in `design/site/`, reference only).

## Done

### Phase 1 — Foundation (2026-10-03)
- `design/site/` bundle saved (site HTML, support.js, logos, logo-contours.json); excluded from ESLint, tsconfig and Tailwind scanning (`@source not`).
- `app/globals.css`: all design tokens (colors, weights, spacing/gutters, radii, key-press shadows, easing, durations, backdrop gradient). Tailwind default colors, text sizes, leading, tracking, radii, shadows and easings are reset so only NeuraOS tokens exist. Base: selection, focus-visible ring, reduced-motion.
- `styles/fonts.ts`: Geist + Geist Mono (next/font/google, variable fonts, CSS variables).
- `styles/typography.ts`: full type scale (display, headings, lead, UI, mono, device-*).
- `components/ui/`: Text (polymorphic), Container (gutters), Section (anchored, labelled), Backdrop.
- `app/layout.tsx`: fonts, metadata, viewport theme color, skip link, backdrop. `app/page.tsx`: empty `<main id="main">`.
- `app/icon.svg` from the logo mark (adapts to dark browser UI); starter favicon and public SVGs removed.
- Packages: `clsx`.

### Phase 2 — Nav (2026-10-04)
- `components/ui/LogoMark.tsx`: hex mark as inline SVG (`currentColor`), paths verified identical to `logo7-black.svg`.
- `components/ui/keyStyles.ts` + `ButtonLink.tsx`: pressable key buttons, one `look` per tone/size the design uses (`dark-sm`, `dark-lg`, `accent-md`, `accent-lg`, `accent-field`, `light-md`); edge collapses and the key drops 3–4px on press.
- `components/ui/Link.tsx`: text link with accent hover (`nav` tone; footer tones come with the footer).
- `lib/content.ts`: brand name, nav anchors, "Get the app".
- `components/sections/SiteNav.tsx`: fixed 72px header, white-to-clear gradient, brand (hover accent), `<nav aria-label="Main">` with anchor list + CTA. Rendered in `app/page.tsx`.
- Globals: `--duration-hover`, no tap highlight on links/buttons.

### Phase 3 — Hero (2026-10-04)
- `components/sections/Hero.tsx`: full-height (`100svh`) opening screen, copy anchored to the bottom (space above is for the 3D logo). h1 "A second opinion, always on call.", lead, Download (`accent-md` → #get) and See how it thinks (`light-md` → #cores), mono meta strip.
- Reveal tokens in globals: `animate-reveal` / `animate-reveal-late` (fade with `ease` + 24px rise with the reveal curve, 1s; late = 150ms stagger), keyframes `reveal-fade` / `reveal-rise`.
- `lib/content.ts`: `sectionIds` is the single source for section ids and anchor hrefs (nav uses it too).

### Phase 4 — Cores (2026-10-04)
- `components/sections/Cores.tsx`: 420vh section with a pinned (`sticky`, `100svh`) panel: h2 "Six cores. One clinical mind." + list. Right side left for the 3D logo.
- `components/parts/CoresList.tsx` (client): `<ol>` of the six cores (number, `h3` name, description). Active core gets the accent bar, ink name and its description; others dim to `ghost`. Bar/color fade 400ms; descriptions expand/collapse smoothly (grid rows + opacity) and stay in the DOM for screen readers; active item has `aria-current`.
- `hooks/useActiveCore.ts`: rAF-throttled passive scroll listener; progress through the section split into 6 equal bands, last core kept outside the section (same math as the design).
- `lib/content.ts`: `cores` copy.

### Phase 5 — Privacy (2026-10-04)
- `components/sections/Privacy.tsx`: 130vh section, block on the right (max 450px): h2 "Patient data stays yours.", lead, guarantees as a `<dl>` (label / mono value rows with hairlines).
- `components/motion/Reveal.tsx` (client): IntersectionObserver (15% visible) → applies `animate-reveal` once, then disconnects.
- Globals: `[data-reveal="pending"]` is hidden only under `@media (scripting: enabled)`, so content stays visible without JS.
- `lib/content.ts`: `privacyFacts`.

### Phase 6 — App (2026-10-04)
- `components/sections/AppShowcase.tsx`: 130vh section, copy (h2 "Thinks like your specialty.", lead, setting chips as a `<ul>`) beside the phone, wrapping on narrow screens.
- `components/parts/PhoneMockup.tsx`: 300×640 screen in a 9px frame: status bar, case header (app logo via next/image), case bubble, "Second opinion · thought 8s" badge, differential card, reasoning, sources, composer. One `role="img"` with a descriptive label.
- `components/ui/Chip.tsx`: static pill with the light key finish.
- `Reveal` gains `kind="device"` → `animate-reveal-device` (40px rise, 1.1s, 100ms delay) as in the design.
- Typography: `device-tag` (mono 12.5px, differential likelihoods). Asset: `public/brand/logo-app.png`.

### Phase 7 — Get the app (2026-10-04)
- `components/sections/GetTheApp.tsx`: full-height (`100svh`) closing section, content centred at the bottom: h2 "Bring it your hardest case." (`display-cta`), App Store (`accent-lg`) and Google Play (`dark-lg`) keys, disclaimer caption. Revealed on scroll.
- `lib/content.ts`: `storeLinks` (placeholder `#get` hrefs, as in the design).

### Phase 8 — Footer (2026-10-04)
- `components/sections/SiteFooter.tsx`: full-height (`100dvh`) dark sheet, 36px rounded top, above main and the fixed nav (`z-11`). Clinical brief block, `<nav aria-label="Footer">` with three link columns, legal bar, edge-to-edge wordmark (decorative, `aria-hidden`).
- `components/parts/NewsletterForm.tsx` (client) + `app/actions.ts` (Server Action `subscribe`): labelled email field, Subscribe key, inline status (`aria-live`). Works without JS. **Validates only — nothing is stored until a provider is chosen.**
- `components/ui/Button.tsx`: `<button>` key sharing `keyStyles`. `Link` gains `night` / `night-muted` tones (hover `accent-hi` for contrast on dark).
- Wordmark: `@container` + `19.9cqi` (measured: Geist 600 "NeuraOS" = 4.3em; logo .72em + gap .16em + tracking → 96% fill, capped at 250px), replacing the design's JS fit.
- Typography: `link` (14px, lh 1), `field` (15px input). Spacing: `--spacing-wordmark-top`. `lib/content.ts`: `footerColumns`, `legalLinks`.

### Phase 9 — Global motion (2026-10-04)
- `components/motion/SmoothScroll.tsx` (client, in layout): Lenis 1.3 with the design's settings (lerp .075, wheel ×0.9, touch ×1.4, `autoRaf`) + `lenis/dist/lenis.css`. In-page anchors glide in 1.6s (ease-out quart); `#` scrolls to top. Keyboard-activated anchors move focus to the target on arrival; the skip link keeps native jump + focus. Reduced motion: Lenis off, native anchors (re-evaluated if the preference changes).
- `components/motion/ScrollEffects.tsx` (client, in layout): one rAF-throttled scroll listener drives the 3px accent progress bar (scaleX = page progress), the staggered nav fade/lift/blur as the footer rises (`[data-nav-item]` in `[data-site-nav]`, nav stops taking clicks below 40%), the bar fading with the nav, and the footer corners flattening (36px → 0 over the last 260px). Math matches the design.
- Globals: no focus ring on `tabindex="-1"` targets (programmatic focus after anchor jumps).
- Package: `lenis`.

### Phase 10 — 3D logo (2026-10-04)
- `lib/scene/` (framework-free three.js, r186): `config` (hex centres, links, the five section poses, materials, studio, dust), `geometry` (rounded hex extrusions), `model` (chrome hexes + glowing plates + rods, particle cloud, PMREM studio reflections), `layout` (fit the logo into the free space above/beside each section's content; fractional stage from scroll), `animate` (per-frame hex/rod posing), `run` (renderer, loop, pointer, cleanup).
- `components/scene/LogoSceneLoader.tsx` → `LogoScene.tsx` (client): three.js loads as its own chunk via `next/dynamic` (`ssr: false`) once the browser is idle after first paint; fixed full-viewport layer between the backdrop and the page.
- Sections opt in with `data-scene-stage` and mark the content to avoid with `data-scene-anchor` (all five sections tagged).
- `lib/coreProgress.ts`: shared section-progress / active-core maths (Cores list + scene). `useActiveCore` now uses it.
- Behaviour (as designed): assembled logo above the hero copy → exploded beside the cores (the active core's hex lifts and glows) → stacked column with a running light beside Privacy → beside the phone → full turn above the closing CTA with the key light swelling. Hover lifts a hex (pointer cursor); pointer parallax, float and drift; accent dust cloud.
- Verified headlessly (bun): stage maths, core bands, smoothing, rods spanning hexes, stacked column order, no NaNs (24 checks).
- Packages: `three`, `@types/three` (dev).

### Design update 1 — launch-soon notice + footer (2026-10-04)
Diffed against the previous design file; only these changed (`design/site/` refreshed).
- CTAs are now buttons that show a "launching soon" notice instead of linking to #get: nav **Try it** and hero **Try it on web** → "NeuraOS for web"; **App Store** → "NeuraOS for iOS"; **Google Play** → "NeuraOS for Android". Same key looks as before.
- `components/parts/LaunchToast.tsx` (client, in layout) + `lib/launchToast.ts` (tiny external store): hand-built pill matching the design — bottom-centre, 28px up, logo + message + "Launching soon" tag; fades in 350ms / rises 16px over 450ms; hides after 2.6s; a new click replaces the message and restarts the timer. The pill is `aria-hidden`; a separate `role="status"` region announces "<message>. Launching soon." (re-announces repeats). Capped at viewport − 32px, message truncates on tiny phones.
- `components/parts/LaunchSoonButton.tsx` (client leaf): `Button` + `showLaunchToast`.
- Footer: "The clinical brief" block → **Follow the build** with three `night-sm` key links (X / Twitter, YouTube, LinkedIn; new tab, ↗, sr-only "(opens in a new tab)"). Spacer → centred Osler quote (`<figure>`/`<blockquote>`/`<figcaption>`) that fills the free height.
- Removed: newsletter form, `subscribe` Server Action, `field` text style, `accent-field` look and their tokens.
- Tokens: `night-key` / `night-key-end`, `shadow-key-night(-pressed)`, `shadow-toast`, `inset-shadow-badge`, `spacing-quote-y` / `-gap`, `duration-border` / `-toast-fade` / `-toast-move`. Text styles: `quote`, `attribution`, `toast`, `badge`. Look: `night-sm`.

### alpha-launch setup (2026-10-24)
- Branch `alpha-launch` from `upstream/main` for the MVP (spec: `docs/SPEC.md`, tasks: `docs/TASKS.md`, team rules: AGENTS.md "Team").
- Landing page moved to `app/(marketing)/` with its own layout (backdrop, Lenis, scroll effects, toast); root layout keeps html/body/fonts/skip link. Placeholder pages under `app/(app)/` and `app/admin/`.
- `lib/types.ts`, `lib/limits.ts`, `lib/contracts/*` (zod, every SPEC route), `lib/api/client.ts` (typed helpers + `ApiError`), `lib/firebase/{client,admin}.ts`, `lib/server/ai/*` (Vertex: guardrail, streaming answer, extraction, file selector, transcription, PII).
- `firestore.rules` (member / own-doc / admin-claim reads, no client writes), `storage.rules` (deny all), `.env.example`, `typecheck` script.
- Packages: `firebase`, `firebase-admin`, `@google/genai`, `zod`.

### Shared auth, app shell and fork workflow (2026-10-24)
- `components/AuthProvider.tsx` + `hooks/useAuth.ts` (user, loading, signInWithGoogle, signOut, getIdToken); `lib/firebase/client.ts` `currentIdToken()` is the single token source for the provider and `lib/api`.
- `components/RequireAuth.tsx` guards `(app)` and `admin` layouts (redirect to `/sign-in?next=`); `(app)` layout is a two-column shell with `ChatSidebar` (token `--spacing-sidebar`); `app/sign-in/layout.tsx` provides auth to Ashish's page.
- Placeholders: `ChatSidebar` (Dibyanshu), `UserCard` + `GoogleSignInButton` + sign-in page (Ashish).
- AGENTS.md "Team": fork + PR workflow, ownership updates. README "Team setup". TASKS updated.

### Re-split and shared route helper (2026-10-25)
- New split: Dhruti = all UI from the design handoffs + integration; Dibyanshu = chat backend + hooks; Ashish = account/admin backend + hooks (AGENTS.md "Team", docs/TASKS.md rewritten).
- Landing bundle moved to `design/site/`; `design/chat`, `design/groups`, `design/admin` to come (all under the existing `design/` exclusions).
- `lib/server/http/route.ts`: `route(path, { access, body, query, response, handler })` with typed params from the route literal; verifies ID token, App Check (monitor-only, logged), admin claim; zod body/query; response checked against its contract; `ApiError` → `{ error }`; one JSON log line (requestId, uid, route, method, status, latencyMs, appCheck, allowed metric fields only). `lib/server/http/errors.ts`: server `ApiError` with default messages. `app/api/health` uses it.

### U1 — App design system (2026-10-25)
Source: Claude Design project "NeuraOS AI app mockups", saved as reference in `design/chat/` (Web App), `design/groups/` (Join, plus `logo-contours.json` for its 3D logo) and `design/admin/` (Admin).
- `app/globals.css` (additive): app surfaces, danger and amber palettes, PII highlight, card / composer / dialog / drawer / segment / toggle shadows, app key shadows, inset shadows, radii (check, tile, callout, panel, panel-lg, icon-tile, dialog), sidebar widths (280 / 256px), content widths (`max-w-reading|form|page|cases|admin|dialog|card`), `app:` breakpoint at 900px (sidebar overlay below), dot-grid / mask / glow gradients, `animate-spin`. `--spacing-sidebar` 18rem → 17.5rem (app shell only).
- `styles/typography.ts` (additive): app headings (greeting, title, status, stat, profile, dialog, empty, brand, top bar), message / editor / reading / input text, UI label sizes, mono pill / table head / field label / key label / count / meta / link, avatar initials.
- `components/ui/keyStyles.ts`: 14 `app-*` key looks (accent sm–xl, light xs–lg, danger, dark, danger outline / ghost, silver and night-ghost for dark cards). Landing looks unchanged.
- New primitives: Icon (+ `icons.ts`, the design's paths), IconButton, Avatar (+ `avatarTone.ts`: same name hash and initials as the design), AvatarStack, StatusPill, StatusChange, Panel, SectionLabel, KeyValueList, Timeline, Notice, IconTile, EmptyState, Skeleton, Meter, Spinner, TextInput, SearchField, TextArea, Select, FieldRow, FieldSelectRow, Toggle, Checkbox, RadioCard, SegmentedControl, Dialog, Drawer, Toast (+ `toastStore.ts`), AppBrand, DotField, Glow.
- `lib/fixtures/`: users, chats (solo + full 3-member group), messages (every state: done, streaming, error, declined, emergency, system; mentions, replies, citations), files (ready / processing / failed), the doctor's application, contributions and usage, admin lists in contract shapes, config and spend. Fictional only.
- Verified: every class in `components/ui` compiles to CSS (Tailwind 4.3 scratch build).

### U2 — Chat panel, static (2026-10-25)
- Shell: `app/(app)/layout.tsx` = SidebarProvider (docked ≥ 900px, overlay with scrim below; Esc / tap outside / navigation closes it) + AppSidebar + page + Toast. `components/app/`: SidebarProvider, sidebarContext (`useSidebar`), AppSidebar, SidebarToggle, TopBar.
- Sidebar (`components/chat/ChatSidebar`): brand, search (filters titles), new-chat key, the open chat's files as "Case files", chats grouped Today / Yesterday / Earlier (group icon, raised active row), `UserCard` → /profile.
- `/chat`: home with the black 3D hex logo (`lib/scene/badge.ts` + `components/scene/HexBadge*`, reusing the landing geometry with a new `GLOSS` finish; still frame with reduced motion), local-time greeting, composer.
- `/chat/[chatId]`: ChatScreen (top bar with "Make group" or members + "Invite"), MessageList (opens at the latest message, follows while near the bottom, `role="log"`), rows for system / peer / own / AI.
- States built where the design had none: AI error and stale streaming (> 45 s) with Retry, declined (grey callout), emergency (red callout + tap-to-call 108 / 112), "Thinking…" before the first token, blinking cursor, cited-file chips, thumbs up / down (+ reason dialog), Reply action with quote in bubble and strip above the composer, mention highlighting.
- Composer: auto-growing textarea (`field-sizing`), Enter sends / Shift+Enter newline, counter near 4,000, attach with type / size / per-chat limit checks, pending file chips (uploading → reading → ready, removable), @mention combobox (AI + members, arrows / Enter / Tab / Esc), send disabled with a spinner while your AI reply runs.
- Static stand-ins (replaced at integration): `usePendingUploads`, `localMessage.ts`, pages reading `lib/fixtures`. Dev-only `NEXT_PUBLIC_UI_PREVIEW=true` skips sign-in so fixture pages render before `.env.local` is filled.
- Shared changes: `Text` accepts `ref` (React 19); `buildLogo(accent, finish)` (landing passes nothing, unchanged); tokens `--container-home`, `--radius-tail`, `--radius-composer`, `--animate-blink`; text variant `card-title`.

### U3 — Groups, static (2026-10-25)
- `components/groups/`: MakeGroupDialog (share-history toggle, files-to-share checklist with count, patient-identifier notice; Create opens Invite), InviteDialog (members line, copyable link with "Copied", full note, owner rotate / revoke, link-off card with Turn on, "Preview join page"), MembersDialog (rows with Owner / Member pill and "Joined …", owner Remove → red confirm, member Leave → confirm with "Also delete the files I shared"), GroupDialogs (wires all three to a chat; static local changes + toasts + system messages).
- A chat shows as a group once it has other members or an invite token (`isGroupChat`), so a converted chat waiting for its first joiner is already a group.
- `/join/[token]` moved out of the `(app)` shell to `app/join/` (own layout: auth, no redirect), as designed: 3D logo, invite card, states signed out (Google key), ready (account row + Switch + Join), full, dead link, already a member / joined (Open chat). UI preview: `?state=` forces a state.
- Fixtures: second group `chat_ward4` (2 of 3, link on) for the ready state; `previewJoiner` (Dr. Neha Joshi) opens links. `/join/tok_4b8d…` → ready, `/join/tok_9f2c…` → full, anything else → dead link.
- `uiPreview` moved to `lib/firebase/preview.ts` (usable on the server). New: `GoogleMark` (brand colours as tokens), `--radius-sheet-sm`. AGENTS.md: `app/join/**` added to Dhruti.
- Member rows show "Joined …" instead of the design's specialty: clients can't read other users' profiles (rules).

### U4 — Account pages, static (2026-10-25)
- Train mode = `/contribute/*`: sidebar switches to the design's train view (Train badge, New case study, Drafts / In review / Reviewed with counts, Continue a draft) via `SidebarBody`; `?tab=` read under Suspense.
- `/profile` (design "Account"): 76px avatar, name, email, app mode switch (→ /chat or /contribute), Your details (name, specialty, read-only email; Save in the top bar when dirty, static), Referrals on the design's dark card (link + Copy, signed up / got an answer), Verification card → /verify.
- `/verify` (no design): apply form validated with the API's zod schema (details, two upload tiles, consent, error list), status views (pending timeline, needs info with reviewer note + Update, approved with Start contributing, rejected). Preview `?state=none|pending|needs_info|rejected`.
- `/contribute`: tabs + case cards (design), gates for unverified / paused (preview `?state=unverified|paused`). `/contribute/new` and drafts / needs-changes in `ContributionEditor`: title + specialty, Write it (WritePanel with word count and save state) or Talk it through (RecordKey, timer to 10 min, Transcribing…, editable transcript, Record again), Save draft, Submit → CheckingScreen (3D logo; the design's "Structuring") → PiiDialog (flags with excerpts: Edit text / Submit anyway). Submitted / approved / rejected open in `ContributionView` with highlighted PII flags and the reviewer note.
- `/sign-in` (no design, styled like join): terms checkbox, Continue with Google (real sign-in; simulated in UI preview), referral welcome when the cookie is set, back to `?next=`. `ReferralCapture` in the marketing layout stores `?ref=` in `neuraos_ref` for 30 days (invisible). Placeholder GoogleSignInButton removed.
- Static stand-ins: `staticPiiCheck` (names / phones / ID numbers), sample transcript, local save / submit.
- Tokens: `--radius-stop`, `--shadow-record-live`, `--gradient-record-halo`.

### U5 — Admin panel, static (2026-10-25)
- Shell (`app/admin/layout.tsx`): AdminGate (admin claim via `AuthProvider.isAdmin`, design's access-denied screen; preview `?denied=1`), 256px AdminSidebar (Admin pill, sections with icons and review counts, Back to NeuraOS, admin card), overlay below 900px. `TopBar` gained `backHref`.
- `/admin`: stat cards (pending applications, contributions to review with PII count, users, verified doctors), dark AI-spend card with meter, recent activity from the audit log.
- `/admin/applications`, `/admin/contributions`, `/admin/users`, `/admin/audit`: `DataTable` (mono header, rows open via a stretched link or button, skeleton rows, empty states, footer count, sideways scroll on phones) + `TableToolbar` (status tabs with counts, search, specialty filter). Users open the design's drawer (facts, Can contribute switch, application history, contributions, referrals); `?user=` opens it directly.
- Review pages: application (header, applicant details, mock certificate / ID previews with zoom and a full-screen viewer) and contribution (header with code, type, PII flag, status; voice player with seeded waveform and seek; text with PII highlights; contributor card). Right column: DecisionPanel (radio cards, note required unless approving, action key coloured by decision, confirm dialog) or DecidedPanel, plus history.
- `/admin/settings`: feature switches, daily cap (validated with the config schema), today's spend meter (amber ≥ 80 %, red at cap); Save in the top bar.
- Shared: key looks `app-danger-lg`, `app-dark-lg`; text variants `stat-label`, `doc-*` (mock document previews).

### Real data for account and admin (2026-10-28)
- Firebase project `neuraos` connected (named database, `apphosting.yaml`, `docs/SETUP.md`, `check:setup` / `seed:config` / `set-admin`). Ashish's account and admin routes merged.
- P1: landing "Try it" opens `/chat` (→ Google sign-in); `AuthProvider` runs `POST /api/onboarding` once per page load; Sign out on profile and in the admin sidebar. Fixture timestamps (functions) can't cross into Client Components, so pages read data in client `*Container.tsx` files.
- P2 (A1): `hooks/firestore/{useDocument,useCollection}`, `hooks/account/*`, `hooks/admin/*` (lists load every status via the API; a decision refetches all admin lists).
- P3: profile save, verification uploads + submit, case-study drafts, voice recording → upload → transcription, submit through the server PII check (`useCaseStudyDraft`). Static PII check and sample transcript removed.
- P4: admin overview, queues, reviews (signed document / audio links in `SignedDocument` and `VoicePlayer`), decisions, users, settings, audit log. Mock certificate / ID previews and admin fixtures removed.

## Next

1. Test sign-in, profile, verify, case studies and admin against the real project (`bun run set-admin <email>` for admin).
2. Chat (Dibyanshu C1/C4) and uploads/groups (Ashish C2/C3); then wire the chat and join pages, which still read fixtures.
3. Deploy per `docs/SETUP.md`. Landing: final responsive / a11y / reduced-motion pass.

## Decisions

- Motion stack approved by the user: **Lenis** (smooth scroll) and **GSAP** (e.g. ScrollTrigger) may be used where they improve performance or feel, without breaking anything. Install them in the phase that needs them.
- Design-tool props fixed to their defaults: accent #2F6BFF, logo finish Chrome, motion 2, particles on.
- Git: one conventional commit per phase. During the alpha sprint Dhruti's work lands on `alpha-launch`; the fork keeps only main, feat/initial-site and alpha-launch. Never push unless asked.
- No max-width container: full-bleed with fluid gutters, as designed.
- Nav below 640px (`sm`): section links hidden, brand + CTA kept (the full row needs ~460px; the design has no mobile nav).
- Buttons are `look`s (tone + size pairs from the design), not a free tone × size matrix, so every look has its exact shadow. A `<button>` version comes with the footer form.
- Hero reveal is CSS-only on first paint (no JS, h1 is the LCP); same timing as the design's observer. Below-fold sections will use an IntersectionObserver `Reveal` that applies the same `animate-reveal` tokens.
- Hero uses `min-h-svh` instead of `100vh` so the bottom copy isn't hidden behind mobile browser bars. Hero lead uses the shared `lead` line height (1.55; design 1.5).
- Cores active state uses a plain scroll listener, not GSAP ScrollTrigger: it only flips 6 times, so GSAP would add weight for nothing. The 3D phase can reuse the same progress math.
- Cores descriptions animate open/closed (design snaps them in) for a calmer list shift.
- Known contrast trade-off: inactive core names use `ghost` (#A3A9B5, ~2.4:1 on white) as designed — a deliberate focus dim; every name reaches full ink when active.
- Phone mockup is one labelled image for screen readers (status bar and UI chrome would be noise). Below ~340px viewports the fixed 318px phone is tight; revisit if small phones matter.
- Get the app keeps the shared page gutters (design: fixed 24px); invisible on centred content.
- GSAP not used so far: every scroll effect is a few style writes per frame from one listener, and Lenis covers smoothing and anchors. Adding GSAP + ScrollTrigger (~35KB gz) would buy nothing here; reconsider if a timeline-heavy effect comes up.
- Progress bar, nav fade and footer sheet share one component/listener instead of three (plan had NavFade / FooterSheet / ScrollProgress) — same behaviour, one scroll handler.
- 3D scene vs design: smoothing is frame-rate independent (design's per-frame lerps ran 2× faster on 120Hz screens); rendering pauses while the footer covers the viewport; half the particles below 640px; canvas fades in over 1s; accent and dust tint come from the CSS tokens. Dropped the design's unused intro, halo and outline lines. Reduced motion: no float, drift, parallax or running light (poses still follow scroll). No WebGL: nothing mounts.
- In-page and store links are plain `<a>` (no routes to prefetch); switch to `next/link` if internal pages appear.
- Type: display/headings fluid as designed; `lead`/`title` ease down on phones; UI text fixed; phone mockup text fixed (device illustration). All sizes in rem.
- Light theme only (design has no dark mode).
- No `tailwind-merge`: it would confuse custom color vs size classes (`text-ink` vs `text-[length:…]`). Use `clsx`.
- 3D scene only needs the 6 hex centres from `logo-contours.json` → inline constant; the design's unused intro/halo/outline code is dropped.
- Footer wordmark sized with container query units (`20.5cqi`) instead of JS measuring — tune visually.
- Cores: all descriptions stay in the DOM for screen readers; inactive ones collapse visually.
- Nav and footer links get the accent hover (the design's inline colors blocked it).
- Reduced motion: native scroll, no reveals, logo without float/parallax. No WebGL → logo omitted (decorative).
- Phone mockup logo is a different mark → keep `logo-white.png` via next/image.
- Next 16: `next/image` `priority` is deprecated → `preload`; no LCP image on this page (LCP is the h1).

## Open questions

- App (assigned in docs/TASKS.md): join preview endpoint, `guardrailLabel` on AI messages, `PATCH /api/profile`, admin download URLs for documents and audio. Member rows show "Joined …" because clients can't read other users' specialty.

- Real social profile URLs (`socialLinks` in `lib/content.ts`; the design uses each site's home page).
- Clinical / Company / Terms / Security footer links still point at `#top` (no pages yet).
- At launch: turn the `LaunchSoonButton`s back into store / web-app links (`launchCtas` in `lib/content.ts`).
