Perform a fast session initialization for this project. Do all steps silently — output only the final status table.

## Steps

1. **Verify toolchain** — check `pnpm --version`, `node --version`, `git status --short`. Report versions and any dirty files.

2. **Check MCP servers** — confirm `memory`, `filesystem`, `github` are available in this session.

3. **Load project context** — read `CLAUDE.md` (already in context) and confirm stack: React 19 · TS 6 · Vite 8 · Tailwind 4 · Redux Toolkit · React Router 7 · i18next · Vitest.

4. **Check last build state** — run `pnpm typecheck 2>&1 | tail -3` and `pnpm lint 2>&1 | tail -3`. Report pass/fail only.

5. **Summarize session readiness** — print a compact table:

| Check          | Result                |
| -------------- | --------------------- |
| pnpm           | version               |
| node           | version               |
| git            | clean / N dirty files |
| typecheck      | pass / fail           |
| lint           | pass / fail           |
| MCP memory     | available / missing   |
| MCP filesystem | available / missing   |
| MCP github     | available / missing   |

If any check fails, print a one-line fix hint below the table.
