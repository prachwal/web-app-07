---
name: TSX (.tsx) best practices
description: "Use when creating or editing `.tsx` files in this repository. Applies specifically to `**/*.tsx`."
applyTo: "**/*.tsx"
---

- Use named exports for React components; avoid `export default` for components (project convention: no default exports from component files).
- Add TSDoc comments for all exported components and public props interfaces.
- Prefer explicit `Props` interfaces/types and keep components small and focused.
- Use `cn()` from `@/lib/utils` to merge classes and `useReducedMotion()` guard for animations.
- Ensure interactive elements have visible text or `aria-label` to meet WCAG AA requirements.
- Keep JSX aria, semantic tags, and keyboard behavior correct (e.g., avoid non-interactive elements with onClick without role/tabIndex).
- Use the `@/` alias for internal imports and keep presentation & logic separation (hooks/utils outside UI components).
- Run `pnpm format` and `pnpm lint` before committing; prefer `lint-staged` for pre-commit checks.
