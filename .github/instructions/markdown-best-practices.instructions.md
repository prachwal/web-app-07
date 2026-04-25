---
name: Markdown best practices
description: "Use when creating or editing Markdown files in this repository. Applies specifically to `**/*.md` files."
applyTo: "**/*.md"
---

- Preserve blank lines around fenced code blocks.
- Keep Markdown sections clear and avoid unnecessary inline HTML.
- Specify a language for fenced code blocks whenever possible (` ```ts `, ` ```bash `, etc.).
- Prefer repository-provided formatting or linting tools for Markdown when available before saving or committing docs.
- If no dedicated Markdown lint script exists, use standard Markdown style rules and keep formatting consistent.
- Ensure code fences are separated from surrounding text by an empty line before and after the block.
- Do not introduce formatting issues that violate common Markdown rules.
