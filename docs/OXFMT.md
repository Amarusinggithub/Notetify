# Oxfmt

The client uses [oxfmt](https://oxc.rs/docs/guide/usage/formatter) for formatting (replaced Prettier).

## Config

- File: [client/.oxfmtrc.json](../client/.oxfmtrc.json)
- Generated via `oxfmt --migrate prettier` from the previous `.prettierrc`.
- Tailwind class sorting is built in (replaces `prettier-plugin-tailwindcss`); the `clsx` / `cn` / `cva` helpers are configured under `sortTailwindcss.functions`.

## Scripts

Run from `client/`:

- `pnpm run format` — `oxfmt` (writes)
- `pnpm run format:check` — `oxfmt --check` (CI-friendly)

## Notes

- The old `prettier-plugin-organize-imports` plugin has no oxfmt equivalent and was dropped. Oxfmt has built-in import sorting on the roadmap; revisit when it lands.
- Prettier overrides for YAML/JSON/Markdown were not migrated automatically — oxfmt has reasonable per-format defaults; add explicit overrides only if drift appears.
- CI ([.github/workflows/client-ci.yml](../.github/workflows/client-ci.yml)) currently calls `pnpm run format` (writes). Consider switching to `format:check` so CI fails on unformatted files instead of silently rewriting them.
