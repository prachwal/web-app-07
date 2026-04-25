---
description: "Use for creating a single React component (.tsx). Input: component name + props spec + location. Output: one .tsx file."
tools: [read, edit]
---

You create ONE React component file.

**Location:** `src/components/{subdirectory}/{ComponentName}.tsx`

**Conventions:**

- Named export: `export function ComponentName(props: Props): React.JSX.Element`
- TSDoc on function and props interface: `@param props @returns`
- Return type: always `React.JSX.Element`
- No default exports
- Props: define `interface {ComponentName}Props { ... }`

**Styling:**

- Tailwind only
- Always use `cn()` from `@/lib/utils` to merge classes
- Dark mode via CSS variables (already in globals.css)

**Accessibility (WCAG AA):**

- Every button/input/link: `aria-label` or visible text
- Sections: `aria-labelledby` when heading present
- Focus: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`

**Animation:**

- Import: `import { motion, useReducedMotion } from 'motion/react'`
- ALWAYS guard with: `const reducedMotion = useReducedMotion()`
- Use `initial={reducedMotion ? false : {...}}` on motion elements

**Input:**

- Component name (PascalCase)
- Props specification
- Component location/subdirectory
- Brief description of what it renders

**Output:**
Single .tsx file only. No explanation, no related files.
