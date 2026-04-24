# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Greenfield React demo app (`demo-app-react`). TypeScript, pnpm. No build tool, framework, or test runner has been wired up yet — these need to be added before any scripts beyond `pnpm install` will work.

## Package manager

Always use `pnpm`. Do not use `npm` or `yarn`.

## TypeScript

- `strict: true`, `esModuleInterop: true`, `target: es2016`, `module: commonjs`
- JSX is not yet configured in `tsconfig.json` — enable `"jsx": "react-jsx"` when adding React source files.

## Formatting

Prettier is configured (`.prettierrc`):

- single quotes, trailing commas (all), semicolons, 100-char print width, 2-space indent
- LF line endings, final newline required (`.editorconfig`)
