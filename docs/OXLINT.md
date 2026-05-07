# Oxlint

The client uses [oxlint](https://oxc.rs/docs/guide/usage/linter) for linting (replaced ESLint).

## Config

- File: [client/.oxlintrc.json](../client/.oxlintrc.json)
- Generated via `npx @oxlint/migrate` from the previous ESLint flat config.
- Plugins enabled in TS/TSX override: `typescript`, `react`.

## Scripts

Run from `client/`:

- `pnpm run lint` — `oxlint`
- `pnpm run lint:fix` — `oxlint --fix`

## TODO: type-aware rules

The following rules from the old eslint config were skipped at migration time because oxlint's type-aware support was not yet shipped. Re-enable them when oxlint adds type-aware linting.

Add under the `**/*.{ts,tsx}` override → `rules` in `client/.oxlintrc.json`:

```json
"typescript/no-floating-promises": "warn",
"typescript/no-unsafe-assignment": "warn",
"typescript/no-unsafe-argument": "warn",
"typescript/no-unsafe-call": "warn",
"typescript/no-unsafe-return": "warn",
"typescript/no-unsafe-member-access": "warn"
```

Oxlint will likely also need a tsconfig pointer at the root of `.oxlintrc.json` (e.g. `"tsconfigRootDir"`). Check the oxlint docs at the time. Watch https://github.com/oxc-project/oxc/releases for the type-aware milestone.

The original `eslint.config.js` was deleted, so the `npx @oxlint/migrate --type-aware` shortcut cannot regenerate this — hand-edit `.oxlintrc.json`.

## Rules skipped at migration

When the migrator ran it skipped 46 rules: 3 nursery/experimental, 23 type-aware (covered above), 1 not-yet-implemented (`react/no-deprecated`), and 19 unsupported core rules that oxlint will not implement (mostly redundant with TypeScript's own checks: `no-dupe-args`, `no-octal`, `react/jsx-uses-react`, etc.).
