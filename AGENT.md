# Notetify — Agent Guide

## Project Context

- Notetify is a collaborative note-taking app with notebooks, tags, tasks, files, spaces, and sharing
- Real-time multi-user editing is being added via Tiptap + Yjs + Hocuspocus (see @docs/COLLABORATION.md)
- The repo is a monorepo with three deployable services: Laravel API, React/Vite SPA, and a Node Hocuspocus collab server
- The API runs **Laravel 13** on **PHP 8.4** inside Docker
- The client is **React 19 + Vite + TypeScript + Tiptap 3**, package-managed with **pnpm**
- Auth is **Sanctum** (cookie sessions) plus **Laravel Fortify** for the registration/password/2FA flows; Fortify Actions live in `api/app/Actions/Fortify/`
- Authorization uses **Laravel Policies** (one per resource: `NotePolicy`, `NotebookPolicy`, `TagPolicy`, `TaskPolicy`, `SpacePolicy`, etc.)
- Query filtering and pagination uses **spatie/laravel-query-builder** and **spatie/laravel-json-api-paginate**
- All Eloquent models use **HasUuids** (UUID primary keys) and most use **SoftDeletes**
- The data model uses **per-user pivot models** (`UserNote`, `UserNotebook`, `UserSpace`, `UserNoteTag`) so each user sees their own per-note state (pin, order, favorite, notebook assignment) without breaking sharing — this is non-obvious and load-bearing; see @docs/ARCHITECTURE.md
- Sharing is modelled by `NoteShare`, `NotebookShare`, `SpaceShare`
- Postgres 17 is the primary database; `notes.content` is JSONB (Tiptap JSON), and `notes.ydoc_state` (BYTEA, Yjs CRDT) is the planned source of truth during collab
- Redis 8 covers cache, sessions, queue, Pulse ingest, and Hocuspocus pub/sub
- File attachments live in **RustFS** (S3-compatible) — only the URL ends up inside the Tiptap doc
- Metrics on **Laravel Pulse**; debugging via **Telescope** (dev only); queue jobs run under **Laravel Horizon** (Redis-backed, dashboard at `/horizon`)
- Mail: **Mailpit** in dev, **Amazon SES** in prod; logs can ship to **Seq** in dev
- Local dev runs in Docker Compose (`docker-compose.dev.yaml`); the same pattern targets a single AWS EC2 host in prod, with a documented path to migrate db → RDS, redis → ElastiCache
- The Hocuspocus collab service (Node) is partially scaffolded — client deps are installed (`@hocuspocus/provider`, `@tiptap/extension-collaboration`, `yjs`, `y-websocket`, `y-protocols`), the Node service itself is being built per @docs/COLLABORATION.md

## Project Structure

The repo root contains three deployable services and three Compose stacks. Each service has its own Dockerfile under `<service>/docker/Dockerfile` so build context stays scoped.

- API: `./api` — Laravel 13 backend
- Client: `./client` — React + Vite SPA
- Collab: `./collab` — Hocuspocus (Node.js) WebSocket server (per @docs/COLLABORATION.md)
- Docs: `./docs` — architecture and design docs
- Scripts: `./scripts` — operational shell scripts (TLS init, prod start, cleanup, logs)
- Compose stacks: `docker-compose.dev.yaml`, `docker-compose.test.yaml`, `docker-compose.prod.yaml`
- Setup wizard: `./setup.sh` — one-shot env + secrets bootstrap
- Top-level Docker docs: @README.Docker.md

## Key Directories

### API (Laravel)

- Controllers: `api/app/Http/Controllers/` — `AuthController`, `NoteController`, `NotebookController`, `TagController`, `TaskController`, `SpaceController`, `FileController`, `EventController`, `OAuthAccountController`, `UserController`
- Models: `api/app/Models/` — feature models (`Note`, `Notebook`, `Tag`, `Task`, `Space`, `File`, `Event`) and pivot models (`UserNote`, `UserNotebook`, `UserSpace`, `UserNoteTag`) and share models (`NoteShare`, `NotebookShare`, `SpaceShare`)
- Policies: `api/app/Policies/` — one per resource; reused in controllers via `$this->authorize(...)`
- Fortify Actions: `api/app/Actions/Fortify/` — register/reset password/email verification flows
- Observers: `api/app/Observers/`
- Service providers: `api/app/Providers/`
- Routes: `api/routes/api.php` — Sanctum-guarded resource routes
- Migrations: `api/database/migrations/`
- Form requests: `api/app/Http/Requests/`
- Config: `api/config/` — see `services.php` (collab + rustfs blocks), `filesystems.php` (rustfs disk), `sanctum.php`, `fortify.php`
- Docker assets: `api/docker/` — Dockerfile, entrypoints, nginx, php, supervisor configs
- Tests: `api/tests/` — PHPUnit 11

### Client (React)

- Source root: `client/src/`
- Entry: `client/src/main.tsx`, `client/src/App.tsx`
- Routes: `client/src/routes/app-routes.tsx` — react-router v7
- Pages: `client/src/pages/` — `app/`, `auth/`, `settings/`, plus `landing.tsx`, `error.tsx`, `not-found.tsx`
- Layouts: `client/src/layouts/`
- Components by feature: `client/src/components/{app,editor,landing,navigation,search,shared,tags,user}/`
- shadcn/Radix UI primitives: `client/src/components/ui/`
- Hooks: `client/src/hooks/` — `use-note.ts`, `use-notebook.ts`, `use-tag.ts`, `use-task.ts`, `use-space.ts`, `use-event.ts`, `use-file.ts`, plus UI hooks (`use-mobile`, `use-debounce`, etc.) — these wrap react-query
- Services (REST clients): `client/src/services/` — one per resource (`note-service.ts`, `notebook-service.ts`, etc.)
- Zustand store: `client/src/stores/index.ts` plus `client/src/stores/slices/` — slices for `auth`, `note`, `notebook`, `tag`, `task`, `space`, `event`, `file`, `theme`
- Editor: `client/src/components/editor/editor.tsx` plus toolbar/footer/header/skeleton; collab provider wires in here
- Editor context: `client/src/context/editor-context.tsx`
- Axios + CSRF: `client/src/lib/axios.ts` — handles XSRF token cookie, adds `/api` prefix automatically
- Utility helpers: `client/src/lib/utils.ts`
- Type definitions: `client/src/types/`
- Docker assets: `client/docker/Dockerfile`, `client/docker/entrypoint.sh`
- Vitest tests: `client/tests/`
- Cypress e2e: `client/cypress/`

### Docs

- @docs/ARCHITECTURE.md — data model and sharing system
- @docs/COLLABORATION.md — real-time collab (Yjs / Hocuspocus / SSE); **mandatory** before any change to the editor or note body
- @docs/TOLEARN.md — `UserNote` modelling background
- @README.Docker.md — Docker stacks (dev/test/prod) and ops commands
- @README.md — high-level project overview

## UI / UX Standards

Notetify aims for a calm, focused, content-first interface — closer to Notion / Linear / Things 3 than to a generic CRUD dashboard. Every UI decision should serve **clarity, hierarchy, and motion that feels native**. Never start a UI task without first walking through the steps below.

### 1. Always shop here first — existing component inventory

Before writing any new component, search the relevant directory. Reuse and compose; don't reinvent.

**Primitives (shadcn / Radix) — `client/src/components/ui/`** — complete library, do not introduce a parallel one:

`accordion`, `alert`, `alert-dialog`, `animated-group`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `card`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `dropdown-menu`, `empty`, `form`, `hover-card`, `infinite-slider`, `input`, `input-group`, `input-otp`, `item`, `label`, `navigation-menu`, `pagination`, `placeholder-pattern`, `popover`, `progress`, `progressive-blur`, `radio-group`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `sonner`, `spinner`, `switch`, `table`, `tabs`, `text-effect`, `textarea`, `toggle`, `toggle-group`, `toolbar`, `tooltip`.

**Project-specific shared building blocks — `client/src/components/shared/`**:

- `combobox`, `mode-toggle`, `appearance-tabs`, `apperance-dropdown` (theme switching)
- `heading`, `heading-small`, `text-link`, `icon` (typography helpers)
- `card-skeleton`, `input-error`
- `auth-provider-buttons`, `auth-provider-icons`
- `emoji-list`, `suggestion`

**Feature components — `client/src/components/{app,editor,navigation,landing,search,tags,user}/`** — already-composed pieces. Often the right answer is to extend one of these, not start fresh.

If something is genuinely missing, add it to `ui/` (if it's a generic primitive) or `shared/` (if it's project-specific composition). Do **not** add it inside a feature folder if it could be reused elsewhere.

### 2. Design tokens — never hard-code colors, fonts, or radii

The theme is defined in `client/src/index.css` via CSS custom properties. Always reference them through Tailwind's semantic tokens:

| Use this | Not this |
|---|---|
| `bg-background` / `text-foreground` | `bg-white` / `text-black` |
| `bg-card` / `text-card-foreground` | hard-coded greys |
| `bg-primary` / `text-primary-foreground` | `bg-blue-600` |
| `bg-muted` / `text-muted-foreground` | `bg-gray-100` |
| `bg-destructive` | `bg-red-500` |
| `border-border` / `border-input` | `border-gray-200` |
| `ring-ring` | custom focus rings |
| `font-sans` (Instrument Sans) | importing another font |
| `rounded-lg` / `-md` / `-sm` (token-derived) | `rounded-[6px]` |

Editor surfaces have their own token set (`--editor`, `--editor-foreground`, `--editor-accent`, etc.) — use those inside the Tiptap editor area.

Dark mode is handled via the `.dark` class on the root; tokens swap automatically. Never write `dark:bg-gray-900` against hard-coded values — use `bg-background` and let the token resolve.

### 3. The Notetify design language

Internalise these and most micro-decisions follow:

1. **Content is the hero.** Chrome is quiet. Keep contrast on data, not on toolbars. Sidebars and headers use `bg-sidebar` / `bg-muted`, not `bg-primary`.
2. **Hierarchy through typography and spacing, not boxes.** Prefer larger type and more whitespace over more borders. One visual border per "unit" is usually enough.
3. **One accent at a time.** `--primary` is the focal colour for the *one* important action on screen. Stacking three primary buttons is a smell.
4. **Density reflects task.** Reading = generous (lg/xl spacing, leading-relaxed). Listing/scanning = tight (sm spacing, single-line truncation with `text-ellipsis`). Don't pick density at random.
5. **Motion is functional.** Animate state transitions (open/close, mount/unmount, drag), not decoration. Use `tailwindcss-animate` utilities + Radix's built-in transitions. Default duration ~150–200ms, ease-out. Respect `prefers-reduced-motion`.
6. **Feedback is immediate.** Every action gets a response within 100ms — optimistic update, skeleton, spinner, or toast (`sonner`). Never leave the user uncertain.
7. **Empty states tell a story.** Use `Empty` from `ui/empty` with a short headline, one supporting line, and a single CTA. Never ship a blank panel.
8. **Errors are calm.** Prefer inline `InputError` / toast over modal error dialogs. Reserve `AlertDialog` for destructive confirmations only.
9. **Icons are 16/20/24 only.** Use `lucide-react`. Match icon size to text size (1rem for body, 1.25rem for buttons, 1.5rem for headers).
10. **Match macOS/Windows native patterns where they exist** — `Cmd/Ctrl+K` opens command palette (`Command`), `Esc` closes overlays, `Tab` moves focus, arrow keys navigate lists.

### 4. Layout rules

- Use the **8pt spacing scale** (`p-2`, `p-3`, `p-4`, `p-6`, `p-8`, `p-12`). Avoid `p-5`, `p-7`, `p-9` unless there's a real reason.
- Container max-widths: reading content `max-w-prose` or `max-w-3xl`; settings forms `max-w-2xl`; full app shell uses the existing `app-shell` and `Sidebar` primitive.
- Always use `ScrollArea` for any pane that may overflow — never raw `overflow-y-auto` on top-level containers.
- Sticky headers: use `Sheet` for modal panes, `Sidebar` for persistent rails, `Popover` for transient menus. Don't roll your own positioning.
- Touch targets ≥ 40×40px on mobile-relevant surfaces.

### 5. Accessibility — non-negotiable

- Every interactive element is reachable by keyboard. Tab order matches reading order.
- Use Radix primitives — they handle focus trapping, escape, ARIA roles. If you're writing `role="dialog"` by hand, you're doing it wrong: use `Dialog`.
- All icons inside icon-only buttons need `aria-label` or visible `Tooltip`.
- Form inputs always have a `Label` (visible or `sr-only`). Use `Form` from `ui/form` so react-hook-form + aria-invalid wire up automatically.
- Color contrast must meet WCAG AA (the design tokens already pass — don't override them with low-contrast custom colors).
- Animations respect `prefers-reduced-motion`. The `tailwindcss-animate` plugin handles this when used via its utilities; verify if you write custom `@keyframes`.

### 6. Pre-commit UI checklist

For every UI change, walk through this before declaring done:

- [ ] Searched `components/ui/` and `components/shared/` for an existing primitive — reused or extended where possible
- [ ] Used semantic Tailwind tokens; no hex codes, no raw `gray-*`, no hard-coded fonts
- [ ] Looks correct in **both** light and dark mode (toggle via `mode-toggle`)
- [ ] Has loading state (skeleton or `Spinner`), empty state (`Empty`), and error state
- [ ] Optimistic UI on mutations where it makes sense; otherwise visible pending feedback
- [ ] Keyboard-only navigable; visible focus ring (`ring-ring`)
- [ ] Mobile / narrow viewport works (`use-mobile` hook for branchings)
- [ ] No layout shift on data load (reserve space with `Skeleton`)
- [ ] Toasts via `sonner` for transient feedback; `AlertDialog` only for destructive confirmations
- [ ] Animations purposeful, ≤ 250ms, ease-out, respect reduced motion

### 7. Animation Standards

Notetify animations should feel **smooth, intentional, and invisible-when-they-need-to-be**. The goal is the same as Apple/Linear/Notion: motion that confirms what just happened, never motion that begs for attention.

#### 7.1 The two rules that override everything

1. **Smooth, never laggy.** Drop a frame and the whole UI feels broken. Animate only `transform` and `opacity` on the hot path; everything else (width, height, top, left, margin, color of large surfaces) is either layout or paint and will jank under load.
2. **Don't overdo it.** If removing the animation makes the UX worse, keep it. If removing it makes no difference, delete it. A page with seven simultaneous entrance animations is a page that loads slowly *and* communicates nothing.

If you can't articulate what an animation is *telling the user* (state changed, focus moved, item arrived, action confirmed), it shouldn't be there.

#### 7.2 Tools available — pick the lightest one that works

The project has three animation tools, listed in order of preference:

1. **Tailwind utility classes + `tailwindcss-animate` + `tw-animate-css`** — for the 80% case. CSS-only, no JS overhead.
   - Hover/focus transitions: `transition-colors`, `transition-transform`, `transition-opacity`, `duration-150`, `ease-out`
   - Enter/exit on Radix primitives: classes like `data-[state=open]:animate-in`, `data-[state=closed]:animate-out`, `fade-in-0`, `zoom-in-95`, `slide-in-from-top-2` (already wired into shadcn's `Dialog`, `Popover`, `Sheet`, etc. — don't replace them)
   - Skeleton/pulse: `animate-pulse`, `animate-spin`
   - Reach for this **first**.

2. **Radix's built-in transitions** — already used by the shadcn primitives. They handle mount/unmount timing, `data-state` attributes, and reduced motion. **Never replace them with Motion.** When you use `Dialog`, `Sheet`, `Popover`, `DropdownMenu`, `HoverCard`, `Tooltip`, `Tabs` — the animation work is already done.

3. **Motion (a.k.a. Framer Motion, package `motion`, v12)** — for the cases CSS genuinely can't do well:
   - Layout animations across reorders (`layout` prop, `LayoutGroup`)
   - Drag-and-drop with snap/spring physics
   - Coordinated multi-element sequences (stagger, choreographed entrance on landing/auth)
   - Scroll-linked effects (`useScroll`, `useTransform`)
   - Gesture-driven UIs (swipe to dismiss, pull-to-refresh)
   - Shared element transitions (`layoutId`)
   - Interruptible animations that must reverse mid-flight

   Existing Motion-powered components: `text-effect`, `animated-group`, `infinite-slider`, `progressive-blur`. Use these on landing and auth surfaces; **do not** add similar entrance choreography to the main app shell or editor — they slow perceived load on the surfaces users see most.

**Decision tree:**

```
Is it a hover/focus/active state change?     → Tailwind transition utilities
Is it open/close on a Radix primitive?       → Already done by shadcn — leave it
Is it a list item reordering?                → Motion `layout` prop
Is it a drag/swipe/scroll gesture?           → Motion
Is it an entrance animation on landing?      → Motion (use animated-group / text-effect)
Is it an entrance animation in the app?      → Probably skip it; if you must, Tailwind animate-in
Anything else?                               → Try Tailwind first, escalate to Motion only if needed
```

#### 7.3 Performance — the rules that keep it smooth

- **Animate only `transform` and `opacity`.** These are composited on the GPU. Animating `width`, `height`, `top`, `left`, `margin`, `padding`, `border-radius` triggers layout/paint and will drop frames on lower-end devices.
- **Use `transform: translate3d(...)` (or any `transform`) instead of `top`/`left`** for movement.
- **Use `transform: scale(...)` instead of width/height** for size animations.
- **Don't animate `box-shadow` directly.** Stack a pseudo-element with the shadow and animate its opacity instead, or accept the cost on hover-only states (small surface, infrequent).
- **Use `will-change: transform` sparingly** — only on the element being animated, only while it's animating, then remove it. Permanent `will-change` keeps the layer in memory and hurts more than it helps.
- **Avoid animating many elements at once.** A list of 100 items entering with a 30ms stagger is 3 seconds of jank. Either virtualize the list (we have `@tanstack/react-virtual`) or animate only the first ~10 visible items.
- **Don't animate inside large `ScrollArea` content.** Sticky/fixed elements scrolling past trigger paint storms. Pin animations to the viewport, not the scroller.
- **Profile when in doubt.** Chrome DevTools → Performance tab → record an interaction. If you see paint or layout in the flame chart during the animation, you're animating the wrong property.

#### 7.4 Timing and easing — defaults to copy/paste

Match these unless you have a real reason to deviate:

| Use case | Duration | Easing | Tailwind | Motion |
|---|---|---|---|---|
| Color / opacity hover | 150ms | ease-out | `transition-colors duration-150` | `transition={{ duration: 0.15 }}` |
| Small element scale/move | 150–200ms | ease-out | `transition-transform duration-200` | `transition={{ duration: 0.2, ease: 'easeOut' }}` |
| Modal / sheet open | 200–250ms | ease-out | shadcn defaults — leave them | `spring` with low stiffness |
| Drag release / spring | natural | spring | n/a | `transition={{ type: 'spring', stiffness: 300, damping: 30 }}` |
| Page entrance (landing) | 400–600ms | ease-out, staggered | n/a (use Motion) | `staggerChildren: 0.05` |

Rules:
- **Default duration: 150–200ms.** Anything > 300ms feels slow on repeat use. Reserve longer durations for once-per-session entrances.
- **Always `ease-out` for entrances**, `ease-in` for exits, `ease-in-out` for back-and-forth.
- **Springs for physical interactions** (drag, swipe, pull). Tweens for state transitions.
- **No `linear` easing** unless it's a continuous animation (spinner, marquee).

#### 7.5 Reduced motion — non-negotiable

Some users have vestibular disorders. Animation that ignores `prefers-reduced-motion` is a bug, not a stylistic choice.

- `tailwindcss-animate` already respects the media query for its built-in classes — keep using its utilities.
- For Motion, wrap the `MotionConfig`:
  ```tsx
  <MotionConfig reducedMotion="user">
    {/* app */}
  </MotionConfig>
  ```
  This tells Motion to honour the user's OS setting.
- For custom `@keyframes`, wrap in `@media (prefers-reduced-motion: no-preference) { ... }` so the animation only runs when motion is allowed.
- Reduced-motion does **not** mean no feedback — keep opacity fades and instant state changes; only remove translate/scale/rotate.

#### 7.6 Anti-patterns — don't do these

- ❌ Animating `width` or `height` on layout-affecting elements
- ❌ More than two simultaneous entrance animations on a primary surface
- ❌ Bouncy springs on functional UI (sidebar toggle, modal open) — keep springs for gestures
- ❌ Permanent `will-change: transform`
- ❌ Replacing Radix's built-in transitions with custom Motion variants
- ❌ Animating every list item on first paint without virtualization
- ❌ `animate-pulse` on more than skeletons (e.g. animating a real CTA to "draw the eye" is anti-pattern)
- ❌ Parallax / scroll-jacking outside marketing pages
- ❌ Confetti, screen shake, full-screen flashes (ever)
- ❌ Auto-playing entrance animations on every route change

#### 7.7 When asked for "an animation"

Default workflow:

1. **Justify it.** Write one sentence: what state change is this animation communicating? If you can't, drop it.
2. **Pick the lightest tool** from the §7.2 decision tree.
3. **Animate only `transform` / `opacity`** unless you've verified the property is cheap.
4. **Use a default duration (150–200ms) and ease-out** unless you can defend a different choice.
5. **Test under reduced-motion** — toggle via OS setting or DevTools Rendering tab → "Emulate CSS media feature prefers-reduced-motion".
6. **Profile** with DevTools Performance if anything feels less than 60fps.
7. **Cross-check** with the §6 UI checklist.

### 8. When asked for "a beautiful design"

Default workflow:

1. **Identify the primitive.** What shadcn component is the structural backbone? `Card`? `Sheet`? `Command`? Start there.
2. **Define the hierarchy.** What's the one most important thing on this surface? Make it visually dominant. Demote everything else.
3. **Choose density.** Reading or scanning? Pick the spacing scale and stick to it across the surface.
4. **Add the states.** Loading skeleton, empty state, error inline, success toast.
5. **Add the polish.** Subtle hover, smooth open/close, reduced-motion-safe. Use `text-effect` and `animated-group` for entrance animations on landing/auth surfaces only — not on every page.
6. **Cross-check.** Run the §6 checklist.

Avoid: glassmorphism, gradients-on-everything, neon shadows, drop shadows over `shadow-md`, more than two font sizes per component, more than one accent colour per surface.

## State Management Split

This is the most common source of confusion. Use the right tool for each kind of state:

- **Server state** (notes, notebooks, tags, tasks, spaces, files, auth user, etc.) — `@tanstack/react-query` via the `use-*` hooks. Mutations use `useMutation` with optimistic updates and `invalidateQueries`.
- **Local UI state** (selected note id, search query, sort order, theme, language, persisted auth flag) — Zustand store at `client/src/stores/index.ts`, partialized so only the right keys persist to `localStorage`.
- **Collab body state** (Tiptap doc content) — Yjs `Y.Doc` driven by `HocuspocusProvider`. Not in react-query, not in Zustand. The Y.Doc itself is the optimistic update.
- **Form state** — `react-hook-form` + `zod` resolvers.

Do not introduce a third server-state layer (Redux, RTK Query, SWR). Do not put server data into Zustand. Do not put body content into react-query.

## Response Preferences

- Be concise and prioritize code examples
- Suggest PHP solutions that match existing Laravel patterns: thin controllers, form requests for validation, policies for authorization, pivot models for per-user state, Spatie's QueryBuilder for index endpoints
- Use TypeScript with strict typing; do not use `any`
- Use functional React components with hooks; no class components
- Use react-query for server data, Zustand for UI/local state, react-hook-form + zod for forms
- Reference existing project patterns when suggesting new implementations
- When explaining code, focus on implementation details and potential edge cases

## Tool Usage Preferences

- Prefer searching through the codebase before suggesting solutions
- Use error checking after code edits
- Always run Composer and Artisan inside the API container, not on the host (the host is missing `pcntl`/`posix` on Windows and may have a different PHP version):
  - `docker compose -f docker-compose.dev.yaml exec api composer require ...`
  - `docker compose -f docker-compose.dev.yaml exec api php artisan ...`
- Always run pnpm inside the client container or on a WSL host with the matching Node version (Node 22 per the Dockerfile)
- Bring the dev stack up with: `docker compose -f docker-compose.dev.yaml up -d --build`
- Run backend tests with: `docker compose -p notetify-test -f docker-compose.test.yaml run --rm test`
- Run e2e tests with: `docker compose -p notetify-test -f docker-compose.test.yaml --profile e2e up`
- Use the `-p` flag (`-p notetify-dev`, `-p notetify-test`, `-p notetify-prod`) when running multiple stacks on the same host — service names are not env-suffixed and will collide otherwise
- On Windows, prefer WSL2's native filesystem (`~/dev/Notetify`) over `/mnt/c/...` for performance

## Code Style Preferences

- PHP: **Laravel Pint** is the formatter (`api/composer.json` includes it). Follow PSR-12 + Laravel conventions.
- TypeScript: **oxfmt** is the formatter and **oxlint** is the linter (migrated from Prettier + ESLint). See @docs/OXLINT.md and @docs/OXFMT.md. Type-aware lint rules are pending oxlint support — re-enable per @docs/OXLINT.md when available.
- Tailwind v4 — use the existing utility classes; do not add a second styling system
- Use shadcn/Radix primitives in `client/src/components/ui/` rather than introducing a second UI library
- The following is critical: only add explanatory inline code comments if you are specifically asked to; the code should be self-explanatory
- Comments explain **why**, not **what**; default to no comment
- Do not write multi-paragraph docstrings or block comments
- No premature abstraction — three similar lines beat a wrong helper
- Do not add error handling, fallbacks, or validation for scenarios that cannot happen
- Do not add backwards-compatibility shims unless explicitly asked
- Do not create new markdown documentation files unless explicitly asked

## Implementation Preferences

- Match existing controller shape: validate via FormRequest, authorize via Policy, query via Spatie QueryBuilder, return Eloquent resources or paginated JSON-API responses
- Match existing client shape: define a `*-service.ts` for the REST surface, wrap it in `use-*.ts` hooks (react-query), consume via feature components
- Mutations on the client should use optimistic updates + `invalidateQueries` on success
- Per-user note state (pin, order, favorite, notebook assignment) goes through `UserNote`, not `Note` directly — see existing migrations under `api/database/migrations/` for the column splits
- After modifying `composer.json` or `package.json`, run the install inside the container so the lockfile matches the deployed runtime
- After modifying `.env.development`, restart `api` so Laravel re-reads it: `docker compose -f docker-compose.dev.yaml restart api`
- When writing tests, make sure the tests pass — backend tests live in `api/tests/` (PHPUnit 11), frontend unit tests in `client/tests/` (Vitest), e2e in `client/cypress/`
- IMPORTANT: before writing or modifying ANY code that touches `notes.content`, `notes.ydoc_state`, or the editor body, you MUST first read @docs/COLLABORATION.md in full. The data flow rules — BYTEA is the source of truth, JSONB is derived, body is never written via REST, title is the first H1 inside the doc — are non-obvious and easy to violate. Do not rely on inference from existing code; the guide is the authoritative source of truth.
- IMPORTANT: do not add a `notes.title` column. Title lives inside `content` as the first H1; the sidebar extracts it via JSONB path query with an `'Untitled'` fallback.
- IMPORTANT: `PUT /api/notes/:id` (REST) handles **metadata only** (`notebook_id`, `tags`, `is_pinned`, etc.). It must reject `content` and `ydoc_state`. All body edits — including renames — go through Hocuspocus.
- IMPORTANT: never reintroduce `_dev` / `_prod` suffixes on Compose service, container, network, or volume names. Use `-p` for namespacing instead.
- IMPORTANT: never reintroduce file-based Docker secrets (`db/password.txt`, etc.). Secrets come from `.env.*` files via `env_file:` and `${VAR:?...}` interpolation; production refuses to start if required vars are unset.
- IMPORTANT: per-user state (`is_pinned`, `is_favorite`, `order`, `notebook_id` from a user's perspective) lives on `UserNote`, not on `Note`. Adding such a column to `Note` is almost always wrong; check if the existing pivot already covers it before extending the schema.
