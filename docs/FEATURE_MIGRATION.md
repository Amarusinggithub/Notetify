# Feature-Based Migration Plan (client/)

> Plan for moving `client/src` from a **layer-based** layout (group by file _type_) to a
> **feature-based** layout (group by _domain_). Written as a living document — check off
> phases as they land.

**Status:** Phases 0–3 complete (structure moved, builds no worse than baseline). Phase 4 (barrels + boundary lint) pending.
**Scope:** `client/src` only (the React app). `api/` and `collab/` are untouched.
**Last Updated:** 2026-06-11

---

## 1. Why we're doing this

Today, one domain change (say, "notes") spreads across five sibling folders:

```
components/note/   hooks/use-note.ts   services/note-service.ts   store/slices/note-slice.ts   pages/app/notes.tsx
```

To understand or change the notes domain you open five directories and mentally re-assemble
them. As the app grows, every folder grows, and the distance between related files grows with
it. This is the classic failure mode of organizing by **technical role** instead of by
**feature**.

The feature-based layout makes each domain a **vertical slice** — its component, hook,
service, and store live in one folder. A domain change touches one folder. A new engineer
reads one folder to understand a feature. Dead features delete cleanly (`rm -rf features/x`).

This is the structure used by most production React codebases; the canonical public reference
is [bulletproof-react](https://github.com/alan2207/bulletproof-react).

---

## 2. The mental model: three tiers, one-way dependencies

```
app/        ← composition root: router, providers, store setup, layouts
   │            knows about features; wires them together
   ▼
features/   ← vertical slices: notes, tags, tasks, auth …
   │            know about shared; never about each other or app
   ▼
shared/     ← primitives: ui/, lib, utils, generic hooks
                knows about nothing above it
```

**The one rule that makes this worth doing — imports only point downward:**

| From → To            | Allowed? | Why                                                        |
| -------------------- | -------- | ---------------------------------------------------------- |
| `app` → `features`   | ✅       | The app composes features into routes.                     |
| `app` → `shared`     | ✅       | The app uses primitives too.                               |
| `features` → `shared`| ✅       | Features are built on primitives.                          |
| `features` → `features` | ❌    | Sideways coupling. Go through a feature's public `index.ts`, or lift the shared piece into `shared/`. |
| `features` → `app`   | ❌       | Upward dependency. A feature must not know the router/shell. |
| `shared` → `features`| ❌       | The worst one — makes primitives un-reusable.              |

> If you ever feel the need to break a rule, that's the signal a piece is mis-placed: either
> it's actually shared (lift it down to `shared/`) or it's actually app-level glue (lift it up
> to `app/`).

### Why layouts live in `app/`, not in a feature

`AppSidebarLayout` mounts the sidebar (notebooks + tags + search + user) and renders
`<Outlet/>` where **any** feature's page appears. It serves no single domain — it _stitches
domains together_. That is the definition of app-level composition, so it belongs in `app/`
alongside `routes/` and `providers/`.

**Litmus test for `app/` vs a feature:** does this file serve one domain, or stitch domains
together? Stitching → `app/`. One domain → that feature.

---

## 3. Target structure

```
client/src/
├─ app/                          # application composition layer
│  ├─ App.tsx
│  ├─ main.tsx
│  ├─ routes/app-routes.tsx
│  ├─ providers/query-provider.tsx
│  ├─ store/
│  │  ├─ index.ts
│  │  └─ slices/theme-slice.ts   # cross-cutting slice only
│  └─ layouts/                   # app-layout, app/, auth/, landing/, settings/
│
├─ features/
│  ├─ auth/         components/ pages/ services/ store/ tests/
│  ├─ notes/        components/ pages/ hooks/ services/ store/ tests/
│  ├─ editor/       components/ context/ services/ hooks/
│  ├─ notebooks/    components/ pages/ hooks/ services/ store/
│  ├─ tags/         components/ pages/ hooks/ services/ store/
│  ├─ tasks/        pages/ hooks/ services/ store/
│  ├─ spaces/       pages/ hooks/ services/ store/
│  ├─ calendar/     pages/ hooks/ services/ store/   # "events"
│  ├─ files/        pages/ hooks/ services/ store/
│  ├─ search/       components/
│  ├─ user/         components/ hooks/
│  ├─ settings/     pages/
│  └─ landing/      components/ pages/
│
└─ shared/                       # used by 3+ features
   ├─ components/
   │  ├─ ui/                     # shadcn primitives — never import a feature
   │  ├─ app/                    # app-shell, app-header, app-sidebar, app-content…
   │  ├─ navigation/             # breadcrumbs, nav-main, nav-footer, nav-user
   │  └─ shared/                 # icon, heading, mode-toggle, combobox, text-link…
   ├─ hooks/                     # use-mobile, use-mobile-navigation, use-breadcrumbs
   ├─ lib/                       # api.ts, utils.ts
   ├─ utils/                     # helpers, validators, i18n, query-keys
   └─ types/                     # index.ts, vite-env.d.ts
```

### Public API per feature (barrels)

Each feature exposes an `index.ts` barrel. Outside code imports from the feature root, not
from its internals:

```ts
// features/notes/index.ts
export { NoteCard } from './components/note-card';
export { useNote } from './hooks/use-note';
export type { Note } from './types';
```

```ts
// good:  import { NoteCard } from '@/features/notes';
// avoid: import { NoteCard } from '@/features/notes/components/note-card';
```

The barrel is the seam that lets you refactor a feature's internals without touching callers,
and the place to enforce "features talk to features only through their public surface."

---

## 4. File-by-file mapping

| Current                                   | →   | Target                                  |
| ----------------------------------------- | --- | --------------------------------------- |
| `components/app/*`                        | →   | `shared/components/app/`                |
| `components/navigation/{breadcrumbs,nav-main,nav-footer,nav-user}` | → | `shared/components/navigation/` |
| `components/navigation/nav-notebook`      | →   | `features/notebooks/components/`        |
| `components/navigation/nav-tag`           | →   | `features/tags/components/`             |
| `components/editor/*` + `context/editor-context` | → | `features/editor/`                |
| `components/landing/*`                    | →   | `features/landing/components/`          |
| `components/note/*`                        | →   | `features/notes/components/`            |
| `components/search/*`                      | →   | `features/search/components/`           |
| `components/tags/*`                        | →   | `features/tags/components/`             |
| `components/user/*`                        | →   | `features/user/components/`             |
| `components/provider/query-provider`      | →   | `app/providers/`                        |
| `components/shared/*`                      | →   | `shared/components/shared/`             |
| `components/ui/*`                          | →   | `shared/components/ui/`                 |
| `hooks/{use-note,use-note-stream}`        | →   | `features/notes/hooks/`                 |
| `hooks/use-notebook`                      | →   | `features/notebooks/hooks/`             |
| `hooks/use-tag`                           | →   | `features/tags/hooks/`                  |
| `hooks/use-task`                          | →   | `features/tasks/hooks/`                 |
| `hooks/use-space`                         | →   | `features/spaces/hooks/`               |
| `hooks/use-event`                         | →   | `features/calendar/hooks/`             |
| `hooks/use-file`                          | →   | `features/files/hooks/` (confirm — see §6) |
| `hooks/use-initials`                      | →   | `features/user/hooks/`                  |
| `hooks/{use-mobile,use-mobile-navigation,use-breadcrumbs}` | → | `shared/hooks/`            |
| `services/<x>-service`                    | →   | `features/<x>/services/` (collab → editor) |
| `store/slices/<x>-slice`                  | →   | `features/<x>/store/`                    |
| `store/slices/theme-slice`                | →   | `app/store/slices/`                     |
| `store/index.ts`                          | →   | `app/store/`                            |
| `pages/auth/*`                            | →   | `features/auth/pages/`                  |
| `pages/settings/*`                        | →   | `features/settings/pages/`             |
| `pages/app/{notes,home}`                  | →   | `features/notes/pages/`                 |
| `pages/app/{notebook,tags,tasks,spaces,files,calender}` | → | matching feature `pages/` |
| `pages/app/shared`                        | →   | `features/sharing/pages/` (cross-entity view) |
| `pages/app/trash`                         | →   | `features/trash/pages/` (cross-entity view) |
| `pages/{landing,error,loading,not-found}` | →   | `landing` feature / `app/` (see §6)     |
| `layouts/*`                               | →   | `app/layouts/`                          |
| `routes/app-routes`                       | →   | `app/routes/`                           |
| `App.tsx`, `main.tsx`                     | →   | `app/`                                  |
| `tests/auth/*`, `tests/notes/*`           | →   | co-locate under each feature's `tests/` |

---

## 5. Alias setup (do this first, before any move)

A single `@/*` alias makes feature/shared imports indistinguishable from internals. Add
intent-revealing aliases so the dependency tiers are visible in every import line and lintable.

**`vite.config.ts`**
```ts
resolve: {
  alias: {
    '@':         path.resolve(__dirname, './src'),
    '@app':      path.resolve(__dirname, './src/app'),
    '@features': path.resolve(__dirname, './src/features'),
    '@shared':   path.resolve(__dirname, './src/shared'),
  },
},
```

**`tsconfig.app.json`**
```jsonc
"paths": {
  "@/*":         ["./src/*"],
  "@app/*":      ["./src/app/*"],
  "@features/*": ["./src/features/*"],
  "@shared/*":   ["./src/shared/*"]
}
```

Keep `@/*` working throughout the migration so we can move folders incrementally without a big
bang. Tighten/remove it only at the end if desired.

> Also update: `vitest.config.ts`, `cypress.config.ts`, and `components.json` (shadcn `aliases`
> block) so generated components land in `shared/components/ui`.

---

## 6. Open questions to resolve before moving

- **`use-file` / `file-service`** — does this belong to the `files` page feature, or to the
  `editor` (attachments)? Check imports; pick one owner. Listed under `files` provisionally.
- **`pages/app/shared.tsx` and `trash.tsx`** — RESOLVED: these are cross-entity views (they
  span notes, notebooks, spaces), so each got its own feature: `features/sharing/` and
  `features/trash/`. They were *not* buried under `notes/`.
- **`error`, `loading`, `not-found` pages** — app-level fallbacks, not a domain. Lean toward
  `app/pages/` (a new small folder) rather than a feature.
- **`nav-notebook` / `nav-tag`** — feature-owned (chosen here) vs. `shared/navigation`. Either
  is defensible; pick one rule and apply it to both.
- **Barrel granularity** — one `index.ts` per feature now; split later only if circular-import
  pain appears.

---

## 7. Phased execution (each phase must compile + pass tests)

The golden rule: **never break the build between phases.** Because `@/*` keeps resolving by
absolute path, we can move one tier at a time and fix imports as we go.

**Phase 0 — Prep**
- [ ] Land alias config (§5). Verify `pnpm build` + `pnpm test` still green (no files moved yet).
- [ ] Agree on §6 open questions.

**Phase 1 — `shared/`** (lowest tier, no inbound feature deps yet)
- [ ] Move `ui/`, `lib/`, `utils/`, `types/`, generic `hooks/`, and the cross-cutting
      `components/{app,navigation,shared}` into `shared/`.
- [ ] Rewrite imports (codemod, §8). Build + test.

**Phase 2 — `app/`**
- [ ] Move `App.tsx`, `main.tsx`, `routes/`, `layouts/`, `providers/`, store root + theme slice.
- [ ] Build + test.

**Phase 3 — features, one at a time** (start with the most self-contained)
Suggested order: `landing` → `search` → `user` → `tags` → `tasks` → `spaces` → `calendar`
→ `files` → `notebooks` → `notes` → `editor` → `auth`.
- [ ] For each feature: create folder, move its components/hooks/services/store/pages/tests,
      add `index.ts` barrel, rewrite imports, build + test, commit. **One feature per commit.**

**Phase 4 — Enforce the boundary**
- [ ] Add an import-boundary lint rule (§9) so the tiers can't silently re-couple.
- [ ] Update `docs/ARCHITECTURE.md` with the new layout and link this doc.
- [ ] Optionally remove/narrow the catch-all `@/*` alias.

---

## 8. Mechanics of moving (don't hand-edit imports)

- Use `git mv` so history follows each file.
- Rewrite imports with a codemod, not by hand. Options:
  - **ts-morph** script (most reliable for path rewriting), or
  - VS Code "Move file" refactor (updates imports automatically) for small batches, or
  - find-and-replace on alias prefixes once folders are in place.
- After each phase: `pnpm -C client build && pnpm -C client test` (and `lint`/`typecheck`).
- Commit per phase / per feature so any regression is bisectable.

---

## 9. Enforcing boundaries (Phase 4)

Add a lint rule so violations fail CI instead of relying on discipline. With oxlint/eslint use
an import-boundary rule expressing:

```
shared/*    may NOT import @features/* or @app/*
features/*  may NOT import @app/*  and may NOT import another feature's internals
            (only its own files or another feature's index barrel)
app/*       may import anything
```

(If oxlint lacks a boundaries rule yet, track it alongside the note in
[`project_oxlint_type_aware`] memory and revisit — same "re-add when supported" pattern.)

---

## 10. Risks & mitigations

| Risk                                          | Mitigation                                              |
| --------------------------------------------- | ------------------------------------------------------- |
| Big-bang move breaks everything at once       | Phased, per-feature commits; keep `@/*` alias alive.    |
| Circular imports via barrels                  | Keep barrels thin; import internals within a feature.   |
| `git blame` / history loss                    | `git mv` (never delete+create).                         |
| Test/cypress configs miss new aliases         | Update all four configs in Phase 0 (§5).                |
| "Shared vs feature" bikeshedding mid-move     | Decide §6 up front; the litmus test in §2 resolves ties. |
| Merge conflicts with in-flight branches       | Do the move on a quiet branch; rebase feature work after. |

---

## 11. Progress log

- 2026-06-11 — Plan drafted.
- 2026-06-11 — **Phases 0–3 executed.** Moved 192 files into `app/` / `features/` / `shared/`
  via a one-shot codemod (git-tracked renames, history preserved); rewrote ~145 files' `@/`
  imports. Added `@app`/`@features`/`@shared` aliases to vite, tsconfig, vitest; pointed
  `index.html` at `src/app/main.tsx`, vitest `include` at `src/**`, and `components.json` at the
  new shared paths. Co-located `tests/auth` and `tests/notes` under their features
  (`setup.ts` stays in `tests/`).
  - **Resolved decisions:** `use-file` → `files`; `shared.tsx` → own `features/sharing/`,
    `trash.tsx` → own `features/trash/` (both cross-entity views); `home.tsx` → `notes/pages`;
    `error`/`loading`/`not-found` → `app/pages`;
    `nav-notebook`/`nav-tag` → their feature; `assets/` left at `src/assets` (alias unchanged).
  - **Verification:** typecheck diffed against a clean HEAD worktree — **0 new errors**, and the
    move **fixed 16 pre-existing errors** (a long-standing `@/stores`→`@/store` import typo that
    had been degrading the whole store to `any`). Fixing it surfaced 2 latent type bugs, also
    fixed: `verify-email.tsx` tested a `void` return for truthiness; `app-header.tsx` passed
    `string | null` avatar to a `string | undefined` prop. The 65 remaining tsc errors are all
    pre-existing and unrelated to layout (missing deps like `react-loading-skeleton`,
    never-created files like `@/hooks/use-appearance`, untyped `suggestion.tsx`/`emoji-list.tsx`,
    tag-type drift). Vitest discovers all tests at the new paths.
- 2026-06-11 — **Follow-up:** promoted `shared`/`trash` out of `notes/` into their own
  `features/sharing/` and `features/trash/` (they're cross-entity views). Fixed a pre-existing
  broken import in `app-routes.tsx` — `notesLoader` was imported from a never-existent
  `@/components/app/app-notes-sidebar`; it actually lives in `notes/components/notes-sidebar.tsx`
  (one more pre-existing error fixed; 65→64).
- 2026-06-11 — **Dashboard feature added.** The home screen composes widgets from several
  features (notes, tasks, calendar, notebooks), so it became its own `features/dashboard/`
  rather than living under any one feature or bloating `app/`. Pattern established: each leaf
  feature exposes a dashboard-ready widget (`RecentNotes`, `UpcomingTasks`, `MiniCalendar`,
  `NotebookGrid`) through a new public `index.ts` barrel; `dashboard/pages/home.tsx` imports
  those barrels and arranges them in a `DashboardGrid` shell. Route now lazy-loads
  `@/features/dashboard/pages/home`. This is the first slice of the Phase 4 barrels work and
  demonstrates the one-way rule: dashboard → feature barrels, no leaf feature depends on another.
- **Remaining (Phase 4):** extend the `index.ts` barrels to each feature's full public surface
  (§3), add the import-boundary lint rule (§9), then optionally narrow the catch-all `@/*`
  alias. Deferred to keep changes low-risk and reviewable.
```
