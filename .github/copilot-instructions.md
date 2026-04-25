# Project Guidelines — web-app-07

React 19 + TypeScript 6 + Vite 8 + Tailwind 4 SPA. Package manager: **pnpm** (never npm/yarn).

## Stack

| Layer      | Package                                      | Version   |
| ---------- | -------------------------------------------- | --------- |
| UI         | react + react-dom                            | 19.x      |
| Types      | typescript                                   | 6.x       |
| Build      | vite + @vitejs/plugin-react                  | 8.x       |
| Styling    | tailwindcss + @tailwindcss/vite              | 4.x       |
| Components | shadcn/ui (new-york, copied to src/components/ui/) | —   |
| State      | @reduxjs/toolkit + react-redux               | 2.x / 9.x |
| Routing    | react-router                                 | 7.x       |
| i18n       | i18next + react-i18next                      | 26.x / 17.x |
| Forms      | react-hook-form + zod + @hookform/resolvers  | —         |
| Animation  | motion                                       | —         |
| Icons      | lucide-react                                 | —         |
| Tests      | vitest + @vitest/coverage-v8 + @testing-library/react | 4.x |
| Docs       | typedoc + typedoc-plugin-markdown            | 0.28.x    |
| Lint       | eslint 10 + typescript-eslint 8 + jsx-a11y + tsdoc | — |
| API router | hono                                         | 4.x       |
| API deploy | @vercel/node                                  | 5.x       |

## Commands

```bash
pnpm dev              # dev server (localhost:5173)
pnpm build            # tsc --noEmit && vite build
pnpm preview          # preview production build
pnpm test             # vitest watch
pnpm test:coverage    # vitest run --coverage → artifacts/coverage/
pnpm lint             # eslint .
pnpm lint:fix         # eslint . --fix
pnpm format           # prettier --write .
pnpm typecheck        # tsc --noEmit
pnpm docs             # typedoc → artifacts/docs/
```

## Copy / Markdown files

- For all `.md` files, keep fenced code blocks surrounded by blank lines.
- Use markdown linting or formatting when available before saving or committing docs.
- Avoid introducing formatting issues that violate common Markdown rules.

## Architecture

```
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

## Conventions

- **Path alias**: `@/` maps to `src/`
- **Theming**: Redux `themeSlice` → ThemeProvider applies `.dark` class to `<html>`
- **i18n language**: Redux `localeSlice` → `i18n.changeLanguage()` on dispatch
- **Class merging**: always use `cn()` from `@/lib/utils`
- **WCAG AA**: all interactive elements need `aria-label` or visible text; skip-to-content link required
- **Motion**: wrap animated elements with `useReducedMotion()` guard
- **TypeDoc**: all exported functions/components require TSDoc comments (enforced by eslint-plugin-tsdoc)
- **Artifacts**: `/artifacts/` is gitignored — coverage reports and TypeDoc output live here
- **No default exports** from component files; use named exports only
- **Never edit** `pnpm-lock.yaml` or files under `artifacts/` directly

## API layer

- All `/api/*` routes are handled by `api/index.ts` (Hono app) via `vercel.json` rewrite.
- Handler export pattern: `export const config = { runtime: 'nodejs' }` + `export const fetch = (req) => app.fetch(req)`.
- Response envelope: `ApiResponse<T>` — `{ status: bool, payload: T, error?, metadata? }`. Use `createEnvelope` / `createErrorEnvelope` from `api/_lib/utils.ts`.
- Logger: `getLogger()` from `api/_lib/logger.ts` — console in dev, noop in prod.
- Shared types between API and frontend live in `packages/shared/`.
- App-specific RTK Query hooks: `useGetHelloQuery`, `useGetHealthQuery` from `src/store/api/appApi.ts`.

## Planning
- For new features, create a `plan.md` with a detailed implementation plan before writing code.
- always translate plan to english, even if the original is in Polish or another language.
- Include steps, relevant files, verification instructions, and any assumptions or decisions made.
- Use the plan as a reference for implementation and testing, and update it if any changes are made during development.
