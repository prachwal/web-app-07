---
description: "Run project session initialization — verify toolchain, check build state, summarize readiness."
---

Perform a fast session initialization for this project. Do all steps silently — output only the final status table.

## Steps

1. **Verify toolchain** — check `pnpm --version`, `node --version`, `git status --short`. Report versions and any dirty files.

2. **Load project context** — confirm stack: React 19 · TS 6 · Vite 8 · Tailwind 4 · Redux Toolkit · React Router 7 · i18next · Vitest.

3. **Check last build state** — run `pnpm typecheck 2>&1 | tail -3` and `pnpm lint 2>&1 | tail -3`. Report pass/fail only.

4. **Summarize session readiness** — print a compact table:

| Check     | Result                |
| --------- | --------------------- |
| pnpm      | version               |
| node      | version               |
| git       | clean / N dirty files |
| typecheck | pass / fail           |
| lint      | pass / fail           |

If any check fails, print a one-line fix hint below the table.
