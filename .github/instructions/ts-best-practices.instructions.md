---
name: TypeScript (.ts) best practices
description: "Use when creating or editing `.ts` files in this repository. Applies specifically to `**/*.ts`."
applyTo: "**/*.ts"
---

- Add TSDoc comments for all exported functions, classes, and utilities (project enforces `tsdoc`).
- Use named exports for reusable utilities and types. Prefer `export const` / `export function` over `export default` for most modules.
- Use the `@/` path alias for internal imports (e.g. `import { store } from '@/store'`).
- Keep module responsibilities small and focused; prefer many small modules over large files.
- Run `pnpm format` and `pnpm lint` before committing; use `lint-staged` hooks when available.
- Keep types explicit on public module APIs; prefer narrower union/enum types to `any`.
- Follow repository conventions in `CLAUDE.md` / `.github/copilot-instructions.md` (TSDoc, path aliases).
