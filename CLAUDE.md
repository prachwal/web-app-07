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
| API router  | hono                                                       | 4.x         |
| API deploy  | @vercel/node                                               | 5.x         |

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

## MCP tools available

This repository is configured for use with an MCP assistant. The assistant has access to:

- file system tools for reading and editing repository files
- terminal/command execution for shell tasks
- git/repository inspection tools
- browser/webpage interaction tools
- memory storage for session and repository notes
- task management utilities for planning and progress tracking

## Architecture

```text
api/                  Vercel serverless functions (Hono router)
  index.ts            entry — export const config + export const fetch
  _lib/
    logger.ts         dev=console / prod=noop logger
    utils.ts          createEnvelope / createErrorEnvelope helpers
  handlers/
    hello.ts          GET /api/hello → ApiResponse<HelloPayload>
    health.ts         GET /api/health → ApiResponse<HealthPayload>
    contact.ts        POST /api/contact → ContactResponse
  types/
    api.ts            ApiResponse<T>, HelloPayload, HealthPayload, HealthStat
packages/
  shared/             shared types (ContactRequest, ContactResponse)
src/
  components/
    api-status/       ApiStatusCards — live data from /api/hello + /api/health
    contact/          ContactForm, ContactFormField, ContactInfo, contactSchema
    hero/             HeroSection (accepts children), HeroHeading, HeroActions
    layout/           Header, Footer, SkipLink, PageLayout, PageLoader, PageMotion
    nbp/              NBP exchange rates feature (grid, tiles, chart, details, filters)
    notifications/    NotificationContainer, NotificationToast
    ui/               shadcn/ui copied components
  i18n/
    locales/{en,pl}/  common.json, hero.json, about.json, contact.json, settings.json, nbp.json
  lib/
    utils.ts          cn() helper (clsx + twMerge)
    format.ts         number / date formatting helpers
    chartColors.ts    chart palette
    dateUtils.ts      date range helpers
    storage.ts        typed localStorage wrapper
    useBreakpoint.ts  responsive breakpoint hook
    useDocumentTitle.ts
    useFavoriteSorter.ts
    usePagination.ts
    useTheme.ts
  pages/
    HomePage          HeroSection + ApiStatusCards
    AboutPage
    ContactPage
    NbpPage           NBP exchange rate dashboard
    SettingsPage
    ErrorPage
    NotFoundPage
  providers/          ThemeProvider, I18nProvider
  routes/             createBrowserRouter, typed route constants
  services/
    contact/          contactService — calls POST /api/contact
  store/
    slices/           themeSlice, localeSlice, notificationsSlice,
                      tableSettingsSlice, uiPreferencesSlice
    api/
      baseApi.ts      RTK Query base (reducerPath: 'api', baseUrl: '/api')
      appApi.ts       useGetHelloQuery, useGetHealthQuery
      nbpApi.ts       NBP public API endpoints
  styles/
    globals.css       Tailwind 4 + design tokens (oklch CSS vars)
  test/
    setup.ts          @testing-library/jest-dom
    utils.tsx         custom render (Redux + Router + i18n)
  App.tsx
  main.tsx
artifacts/            gitignored — coverage/ and docs/
```

## API Notes

- All `/api/*` routes handled by `api/index.ts` (Hono) via `vercel.json` rewrite.
- Handler export pattern: `export const config = { runtime: 'nodejs' }` + `export const fetch = (req) => app.fetch(req)` — `@vercel/node v5` detects `fetch` export before default-unwrapping.
- Response envelope: `ApiResponse<T>` — `{ status: bool, payload: T, error?, metadata? }`. Use `createEnvelope` / `createErrorEnvelope` from `api/_lib/utils.ts`.
- Logger: `getLogger()` from `api/_lib/logger.ts` — `console` in dev, noop in prod (no cold-start penalty).
- Shared types between API handlers and frontend live in `packages/shared/` (ContactRequest, ContactResponse).
- Frontend RTK Query hooks: `useGetHelloQuery`, `useGetHealthQuery` from `src/store/api/appApi.ts` injected into `baseApi`.
- Do not add separate files under `api/contact/` — Vercel would route directly to the file bypassing the main router.

- `src/components/nbp/index.ts` is only a barrel export.
- The reusable part of the NBP feature is the pattern, not the current NBP types:
  - `grid` and `tiles` are still NBP-specific because they bind to `NbpRate`, `NbpRateC`, and `NbpGoldPrice`
  - `chart` is semi-generic because the render shell is reusable, but the data mapping is NBP-specific
  - `details` is intentionally domain-specific
  - `shared/CurrencyName` is the closest thing to a general-purpose helper
- `tableSettingsSlice` is the source of truth for NBP display state:
  - visible columns
  - chart axis presentation
  - layout settings for table rows per page, tiles per page, and tile columns
  - chart settings for interaction mode, legend visibility, grid visibility, and range presets
  - persistence through `localStorage` key `nbp:tableSettings`
- `TableSettingsModal` is the user-facing editor for those settings.
- `NbpGrid` and `NbpTiles` read layout settings from Redux instead of hardcoding page size.
- `NbpChart` is mobile-first and must keep hover/pinned analysis usable without relying on desktop hover alone.
- Current control mapping:
  - table rows per page = `tableRowsPerPage`
  - tiles pagination size = `tileItemsPerPage`
  - tile grid density = `tileColumns`
  - visible table fields = `visibleColumns`
  - chart interaction = `interactionMode`
  - chart legend toggle = `showLegend`
  - chart grid toggle = `showGrid`
  - chart range preset = `rangePreset`
- If a second data page is added later, keep `NbpPage` as the orchestrator and split only the settings/data model that is actually shared.

## Conventions

- **Path alias**: `@/` maps to `src/`
- **Theming**: Redux `themeSlice` → ThemeProvider applies `.dark` class to `<html>`
- **i18n language**: Redux `localeSlice` → `i18n.changeLanguage()` on dispatch
- **Class merging**: always use `cn()` from `@/lib/utils`
- **WCAG AA**: all interactive elements need aria-label or visible text; skip-to-content link required
- **Motion**: wrap animated elements with `useReducedMotion()` guard
- **TypeDoc**: all exported functions/components require TSDoc comments (enforced by eslint-plugin-tsdoc)
- **Artifacts**: `/artifacts/` is gitignored — coverage reports and TypeDoc output live here

## Markdown guidance

- For `*.md` files, preserve blank lines around fenced code blocks.
- Specify a language for fenced code blocks whenever possible (` ```ts`, ` ```bash`, etc.).
- Prefer markdown linting or formatting when available, especially on docs and repo guidance files.
- If the repo does not provide a dedicated markdown lint script, apply standard Markdown style rules manually.
- Keep Markdown sections clear and avoid unnecessary inline HTML.

## Subagent model

Use **claude-haiku-4-5** (model: `haiku`) for Agent tool calls (Explore, Plan, code-reviewer)
unless the task explicitly requires opus/sonnet reasoning.
