# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

React 19 + TypeScript 6 + Vite 8 + Tailwind 4 SPA — demo-app-react.
Package manager: **pnpm** (always, never npm/yarn).

## Stack

| Layer       | Package                                                    | Version     |
| ----------- | ---------------------------------------------------------- | ----------- |
| UI          | react + react-dom                                          | 19.x        |
| Types       | typescript                                                 | 6.x         |
| Build       | vite + @vitejs/plugin-react                                | 8.x         |
| Styling     | tailwindcss + @tailwindcss/vite                            | 4.x         |
| Components  | shadcn/ui (new-york style, copied into src/components/ui/) | —           |
| State       | @reduxjs/toolkit + react-redux                             | 2.x / 9.x   |
| Routing     | react-router                                               | 7.x         |
| i18n        | i18next + react-i18next                                    | 26.x / 17.x |
| Forms       | react-hook-form + zod + @hookform/resolvers                | —           |
| Animation   | motion                                                     | —           |
| Class utils | clsx + tailwind-merge                                      | —           |
| Icons       | lucide-react                                               | —           |
| Tests       | vitest + @vitest/coverage-v8 + @testing-library/react      | 4.x         |
| Docs        | typedoc + typedoc-plugin-markdown                          | 0.28.x      |
| Lint        | eslint 10 + typescript-eslint 8 + jsx-a11y + tsdoc         | —           |

## Commands

```bash
pnpm dev              # dev server (localhost:5173)
pnpm build            # tsc --noEmit && vite build
pnpm preview          # preview production build
pnpm test             # vitest watch
pnpm test:ui          # vitest --ui
pnpm test:coverage    # vitest run --coverage → artifacts/coverage/
pnpm lint             # eslint .
pnpm lint:fix         # eslint . --fix
pnpm format           # prettier --write .
pnpm typecheck        # tsc --noEmit
pnpm docs             # typedoc → artifacts/docs/
```

## Architecture

```
src/
  components/
    hero/       HeroSection, HeroHeading, HeroActions
    layout/     Header, Footer, SkipLink
    ui/         shadcn/ui copied components
  i18n/
    locales/{en,pl}/  common.json, hero.json
  lib/
    utils.ts    cn() helper (clsx + twMerge)
  pages/        HomePage, NotFoundPage
  providers/    ThemeProvider, I18nProvider
  routes/       createBrowserRouter, typed route constants
  store/
    slices/     themeSlice ('light'|'dark'|'system'), localeSlice ('en'|'pl')
    api/        baseApi.ts (RTK Query)
  styles/
    globals.css Tailwind 4 + design tokens (oklch CSS vars)
  test/
    setup.ts    @testing-library/jest-dom
    utils.tsx   custom render (Redux + Router + i18n)
  App.tsx
  main.tsx
artifacts/            gitignored — coverage/ and docs/
```

## Conventions

- **Path alias**: `@/` maps to `src/`
- **Theming**: Redux `themeSlice` → ThemeProvider applies `.dark` class to `<html>`
- **i18n language**: Redux `localeSlice` → `i18n.changeLanguage()` on dispatch
- **Class merging**: always use `cn()` from `@/lib/utils`
- **WCAG AA**: all interactive elements need aria-label or visible text; skip-to-content link required
- **Motion**: wrap animated elements with `useReducedMotion()` guard
- **TypeDoc**: all exported functions/components require TSDoc comments (enforced by eslint-plugin-tsdoc)
- **Artifacts**: `/artifacts/` is gitignored — coverage reports and TypeDoc output live here
