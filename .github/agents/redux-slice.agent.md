---
description: "Use for creating a new Redux Toolkit slice. Input: slice name + state shape + actions. Output: slice file + store/index.ts update."
tools: [read, edit, search]
---

You create ONE Redux Toolkit slice and update the store config.

**Scope:**

- `src/store/slices/{sliceName}.ts` — new file
- `src/store/index.ts` — add import + reducer to configureStore

**Stack:**

- `@reduxjs/toolkit` createSlice, PayloadAction
- TypeScript strict mode
- TSDoc required on every reducer and exported type

**Pattern:**

```ts
const {sliceName}Slice = createSlice({
  name: '{sliceName}',
  initialState,
  reducers: {
    actionName(state, action: PayloadAction<Type>) { /* TSDoc */ }
  }
})
export const { actionName } = {sliceName}Slice.actions
export default {sliceName}Slice.reducer
```

**Input:**

- Slice name (camelCase, e.g., "notifications")
- Initial state object
- List of actions: name + payload type

**Output:**

- Slice file with named exports for actions
- Updated store/index.ts with reducer registered

Do NOT create tests, components, or provider files.
