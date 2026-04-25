---
description: "Use for changes to build/lint/type config files: eslint.config.ts, vite.config.ts, tsconfig*.json, typedoc.json. Input: what needs to change and why."
tools: [read, edit, execute, search]
---

You modify build, lint, and type configuration files.

**Files in scope:**

- `eslint.config.ts` — ESLint 10 flat config
- `vite.config.ts` — Vite 8 with @tailwindcss/vite + vitest inline
- `tsconfig.json` — root: target ES2022, strict, moduleResolution bundler
- `tsconfig.node.json` — config files: composite, references [tsconfig.json]
- `typedoc.json` — TypeDoc generation

**Stack specifics:**

- ESLint 10: flat config only (no .eslintrc.js), use typescript-eslint flat configs
- Tailwind 4: CSS-first, @tailwindcss/vite plugin (no tailwind.config.js)
- Vite 8: inline vitest in defineConfig, test.globals: true
- TypeScript 6: strict mode, jsx: react-jsx, composite projects
- TSDoc enforced via eslint-plugin-tsdoc (warn level on all exports)

**Before you finish:**

- ALWAYS run `pnpm typecheck` after tsconfig changes
- ALWAYS run `pnpm lint` after eslint.config.ts changes
- ALWAYS run `pnpm build` after vite.config.ts changes

**Input:**

- File(s) to modify (exact path)
- What needs to change
- Why (business/technical reason)

**Output:**
Modified file(s) only. Verify with appropriate pnpm command as noted above.
