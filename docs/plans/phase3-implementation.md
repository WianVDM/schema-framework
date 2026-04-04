# Implementation Plan: Phase 3 — Quality Fixes & Production Readiness

[Overview]
Fix known architectural inconsistencies and implement production-ready features for the Schema Framework monorepo.

This plan addresses 7 quality issues identified during the architecture audit of Phases 1-2, followed by 5 production-readiness features. All work will be done on a single `feature/phase3` branch and merged to main via pull request. The quality fixes (Phase 3A) restore full compliance with `docs/ARCHITECTURE.md`. The production features (Phase 3B) extend the framework with CI/CD, accessibility, server-side pagination, theme customization, and internationalization support.

[Types]

Several type changes are required to fix architectural issues and support new features.

### 3A-1: Make FileUpload injectable via PrimitiveComponents

**File:** `packages/core/src/engine/context/primitives-context.tsx`

Add `FileUpload` to the `PrimitiveComponents` interface:

```typescript
FileUpload: ComponentType<FileUploadProps>
```

Where `FileUploadProps` is already exported from `packages/core/src/primitives/file-upload.tsx`. The interface must be updated, and the prop type must be importable by consumers.

### 3A-4: Move onCancel from FormSchema to SchemaFormProps

**File:** `packages/core/src/engine/types.ts`

Remove from `FormSchema`:
```typescript
// REMOVE this line from FormSchema
onCancel?: () => void
```

**File:** `packages/core/src/engine/renderers/schema-form.tsx`

Add to `SchemaFormProps`:
```typescript
interface SchemaFormProps {
  schema: FormSchema
  onSubmit: (values: Record<string, unknown>) => void
  onCancel?: () => void  // MOVE HERE
}
```

This ensures `FormSchema` remains fully serializable (Appendix D compliance).

### 3A-6: Export ValidationRule and other utility types

**File:** `packages/core/src/engine/index.ts`

Add exports:
```typescript
export type { ValidationRule, FieldCondition, FileUploadConfig, StatusConfig, StatusVariant } from './types'
```

### 3B-3: Server-side pagination types

**File:** `packages/core/src/engine/types.ts`

Add to `GridSchema`:
```typescript
serverPagination?: {
  enabled: boolean
  totalRecords: number
  currentPage: number
  onPageChange: (page: number, pageSize: number) => void
}
```

NOTE: `onPageChange` is a callback, so `GridSchema` with `serverPagination` would need the same `Omit` treatment in server functions. Alternatively, separate `serverPagination` into `ServerPaginationConfig` (serializable) and pass `onPageChange` as a renderer prop.

Decision: Keep `GridSchema` serializable. Add `ServerPaginationConfig` to `GridSchema` with `totalRecords` and `currentPage` only. The `onPageChange` handler goes on `SchemaGridProps`.

```typescript
// In types.ts
interface ServerPaginationConfig {
  totalRecords: number
  currentPage: number
}

// GridSchema gets:
serverPagination?: ServerPaginationConfig

// SchemaGridProps gets:
onPageChange?: (page: number, pageSize: number) => void
```

### 3B-5: Internationalization types

**File:** `packages/core/src/engine/types.ts`

Add `I18nConfig` to `FormSchema` and `GridSchema`:
```typescript
interface I18nConfig {
  locale: string
  messages?: Record<string, string>
}
```

Both `FormSchema` and `GridSchema` get an optional `i18n` field. The engine renderers will use `i18n.messages` to override default labels (e.g., "No data available", "Submit", "Cancel", "Next", "Previous").

[Files]

### New Files

1. **`packages/core/src/engine/renderers/theme-provider.tsx`**
   Purpose: Layer 2 theme context provider. Defines `ThemeConfig` interface and `ThemeProvider`/`useTheme` for consuming theme overrides (CSS variable maps, component class overrides).

2. **`packages/core/src/engine/helpers/i18n.ts`**
   Purpose: i18n helper that resolves message keys from `I18nConfig.messages` with fallback defaults. Pure function, no React dependency.

3. **`.github/workflows/ci.yml`**
   Purpose: GitHub Actions CI/CD pipeline. Runs on push/PR to main. Steps: install, lint, type-check, build, test, publish to npm on tag.

4. **`.github/workflows/publish.yml`**
   Purpose: npm publish workflow triggered on release/tag. Builds `@my-framework/core` and publishes.

5. **`apps/showcase/src/routes/demo-grid-inline-edit.tsx`** (optional)
   Purpose: Demonstration route for server-side pagination with the grid. Uses mock delayed server function.

6. **`docs/plans/phase3-implementation.md`** (this file)
   Purpose: Implementation plan.

### Modified Files — Phase 3A (Quality Fixes)

1. **`packages/core/src/engine/context/primitives-context.tsx`**
   - Add `FileUpload` component type to `PrimitiveComponents` interface

2. **`packages/core/src/engine/renderers/field-renderer.tsx`**
   - Remove direct import of `FileUpload` from `'../../primitives/file-upload'`
   - Use `usePrimitives()` to get injected `FileUpload` component (consistent with other field types)

3. **`packages/core/src/engine/types.ts`**
   - Remove `onCancel` from `FormSchema` interface
   - Add `ValidationRule` re-export helper comment
   - Ensure `FileUploadProps` interface is exported (currently inline)

4. **`packages/core/src/engine/renderers/schema-form.tsx`**
   - Add `onCancel` prop to `SchemaFormProps` interface
   - Replace `schema.onCancel` references with the new prop

5. **`packages/core/src/engine/index.ts`**
   - Export `ValidationRule`, `FieldCondition`, `FileUploadConfig`, `StatusConfig`, `StatusVariant` types
   - Export `FileUploadProps` from primitives

6. **`packages/core/src/primitives/index.ts`**
   - Export `FileUploadProps` type for consumer use

7. **`packages/core/src/engine/renderers/schema-grid.tsx`**
   - Implement `bordered` style in `applyGridStyles()` function
   - Add conditional border classes when `bordered === true`

8. **`packages/core/src/engine/renderers/grid-toolbar.tsx`**
   - Add global search/filter input field
   - Wire search value to TanStack Table's `setGlobalFilter`
   - Use `usePrimitives()` for the Input component

9. **`apps/showcase/src/data/primitive-mappings.tsx`**
   - Add `FileUpload` mapping from the Layer 1 primitive to `PrimitiveComponents`

10. **`apps/showcase/src/data/mock-schemas.ts`**
    - Remove any `onCancel` references from form schemas (none currently, but verify)

11. **`apps/showcase/src/server/schemas.ts`**
    - Simplify `SerializableFormSchema` type alias (no longer need to omit `onCancel`)

### Modified Files — Phase 3B (Production Features)

12. **`packages/core/src/engine/renderers/schema-grid.tsx`**
    - Add ARIA roles (`role="grid"`, `role="row"`, `role="gridcell"`, `role="columnheader"`)
    - Add keyboard navigation handlers (arrow keys for cell navigation)
    - Support `serverPagination` mode (external data fetching vs client-side pagination)
    - Use i18n for "No data", pagination labels

13. **`packages/core/src/engine/renderers/schema-form.tsx`**
    - Add ARIA labels to form fields (linked via `aria-describedby`)
    - Add keyboard navigation for form fields
    - Use i18n for "Submit", "Cancel" labels

14. **`packages/core/src/engine/renderers/field-renderer.tsx`**
    - Add `aria-invalid` and `aria-describedby` attributes for validation errors
    - Add `aria-required` for required fields

15. **`packages/core/src/engine/renderers/grid-pagination.tsx`**
    - Add ARIA labels to pagination buttons
    - Use i18n for "Previous", "Next", "Page X of Y"
    - Support server-side pagination mode

16. **`packages/core/src/engine/renderers/grid-column-header.tsx`**
    - Add ARIA sort indicators (`aria-sort="ascending"` / `aria-sort="descending"`)

17. **`packages/core/src/engine/types.ts`**
    - Add `ServerPaginationConfig` interface
    - Add `serverPagination` to `GridSchema`
    - Add `I18nConfig` interface
    - Add `i18n` to `FormSchema` and `GridSchema`
    - Add `ThemeConfig` interface

18. **`packages/core/src/engine/index.ts`**
    - Export `ThemeProvider`, `useTheme`
    - Export `ServerPaginationConfig`, `I18nConfig`, `ThemeConfig`
    - Export i18n helper

19. **`packages/core/src/primitives/index.ts`**
    - Remove `DataTable` export (dead code cleanup) OR keep if it will be used

20. **`apps/showcase/src/app/primitives-provider.tsx`**
    - Wire `FileUpload` into the primitives value

21. **`apps/showcase/src/routes/demo-grid.tsx`**
    - Add `onPageChange` handler demonstration
    - Demonstrate server-side pagination with mock delayed fetch

22. **`docs/ARCHITECTURE.md`**
    - Update Phase 3 status from "Not Yet Implemented" to implemented items
    - Document new `ThemeConfig`, `I18nConfig`, `ServerPaginationConfig` interfaces
    - Document that `onCancel` moved from `FormSchema` to `SchemaFormProps`
    - Document accessibility compliance

### Files to Evaluate for Removal

1. **`packages/core/src/primitives/data-table.tsx`**
   Decision: Remove. `SchemaGrid` builds its own table using injected primitives. `DataTable` is unused dead code that violates the "no `@tanstack/react-table` in Layer 1" rule.

2. **`packages/core/src/primitives/address-input.tsx`**
   Decision: Either wire it up (add `'address'` field type + renderer case) or remove it. Recommend deferring to a future phase since no schema uses it.

[Functions]

### New Functions

1. **`useTheme()` — `packages/core/src/engine/renderers/theme-provider.tsx`**
   Signature: `() => ThemeConfig`
   Purpose: React context hook to consume theme configuration

2. **`ThemeProvider()` — `packages/core/src/engine/renderers/theme-provider.tsx`**
   Signature: `({ theme, children }: { theme: ThemeConfig; children: ReactNode }) => JSX.Element`
   Purpose: Context provider for theme overrides

3. **`resolveMessage()` — `packages/core/src/engine/helpers/i18n.ts`**
   Signature: `(key: string, i18n: I18nConfig | undefined, fallback: string) => string`
   Purpose: Resolve an i18n message key with fallback to default English string

### Modified Functions

4. **`SchemaGrid()` — `packages/core/src/engine/renderers/schema-grid.tsx`**
   Current: `(props: SchemaGridProps) => JSX.Element`
   Changes:
   - Accept `onPageChange` prop for server-side pagination
   - Use `resolveMessage()` for empty state text
   - Add ARIA attributes to table elements
   - Handle `serverPagination` mode (skip client-side pagination when enabled)
   - Apply `bordered` style correctly

5. **`SchemaForm()` — `packages/core/src/engine/renderers/schema-form.tsx`**
   Current: `(props: SchemaFormProps) => JSX.Element`
   Changes:
   - Accept `onCancel` prop (moved from `schema.onCancel`)
   - Use `resolveMessage()` for submit/cancel labels
   - Add ARIA attributes to form elements

6. **`FieldRenderer()` — `packages/core/src/engine/renderers/field-renderer.tsx`**
   Current: `(props: FieldRendererProps) => JSX.Element`
   Changes:
   - Remove direct `FileUpload` import, use `usePrimitives().FileUpload`
   - Add `aria-required`, `aria-invalid`, `aria-describedby` attributes

7. **`GridToolbar()` — `packages/core/src/engine/renderers/grid-toolbar.tsx`**
   Current: `(props: GridToolbarProps) => JSX.Element`
   Changes:
   - Add global search input with `setGlobalFilter` integration
   - Accept `globalFilter` and `onGlobalFilterChange` props (or receive table instance)

8. **`GridPagination()` — `packages/core/src/engine/renderers/grid-pagination.tsx`**
   Current: `(props: GridPaginationProps) => JSX.Element`
   Changes:
   - Add ARIA labels to buttons
   - Use `resolveMessage()` for "Previous", "Next" text
   - Support server-side pagination mode

9. **`GridColumnHeader()` — `packages/core/src/engine/renderers/grid-column-header.tsx`**
   Changes:
   - Add `aria-sort` attribute based on current sort state

10. **`applyGridStyles()` — `packages/core/src/engine/renderers/schema-grid.tsx`**
    Current: Returns className string for `striped` and `hoverable`
    Changes: Add `bordered` handling — when `bordered: true`, add cell border classes

11. **`evaluateCondition()` — `packages/core/src/engine/helpers/evaluate-condition.ts`**
    No changes needed — already correct.

[Classes]

No new classes. All new code uses functional React components and hooks (consistent with existing patterns).

[Dependencies]

### New Dependencies

1. **`.github/workflows/ci.yml`** — No package dependencies; uses `pnpm`, `node`, `turbo` in GitHub Actions
2. **No new npm packages required** — Theme customization uses React Context (already available). i18n uses a simple lookup function. Accessibility uses native ARIA attributes. Server-side pagination is a pattern change, not a library.

### Existing Dependencies — No Version Changes Required

All changes work within the current dependency versions:
- `@tanstack/react-table@^8.21.3` — supports server-side pagination via manual mode
- `@tanstack/react-form@^1.28.6` — no changes needed
- `react@^19` — Context API sufficient for theming
- `zod@^3.24` — no changes needed

[Testing]

### Manual Validation

Since this project currently has no automated test suite, validation will be performed via:

1. **TypeScript Compilation:** `pnpm run build` must pass with zero errors after every change
2. **Visual Verification:** `pnpm dev` — verify all existing routes still render correctly:
   - `/demo` — landing page
   - `/demo-form` — contact form with all field types
   - `/demo-grid` — user grid with sorting, pagination, column visibility
   - `/demo-orders` — order grid with status badges
   - `/demo-registration` — conditional fields + file upload
   - `/demo-support-ticket` — conditional priority + multi-file upload
3. **Regression Checks:**
   - File upload still works after PrimitivesContext migration
   - Grid sort/filter/pagination still works after ARIA additions
   - Form conditional visibility still works after `onCancel` move
   - Cancel button still works on registration and support ticket forms

### Specific Test Scenarios

| Scenario | What to Verify |
|----------|---------------|
| FileUpload injection | Upload files on `/demo-registration` — should work identically |
| Global search filter | Type in GridToolbar search on `/demo-grid` — rows should filter |
| Bordered grid | Set `bordered: true` in a grid schema — cells should have borders |
| ARIA attributes | Inspect DOM — form fields should have `aria-required`, grid should have `role="grid"` |
| Server-side pagination | Navigate pages on `/demo-grid` with server pagination enabled |
| i18n labels | Pass `i18n` config to a form schema — button labels should override |
| Theme overrides | Wrap app in ThemeProvider — custom classes should apply |
| Cancel button | Click Cancel on registration form — should call `onCancel` prop |

[Implementation Order]

The implementation must follow this exact sequence to minimize conflicts and ensure each step builds on the previous:

### Branch Setup
1. Create branch `feature/phase3` from `main`

### Phase 3A — Quality Fixes (in order)

2. **3A-1: Make FileUpload injectable via PrimitivesContext**
   - Update `PrimitiveComponents` interface in `primitives-context.tsx` to include `FileUpload`
   - Update `field-renderer.tsx` to use `usePrimitives().FileUpload` instead of direct import
   - Update `primitive-mappings.tsx` to include `FileUpload` mapping
   - Update `primitives-provider.tsx` to wire FileUpload
   - Export `FileUploadProps` from primitives and engine index
   - Verify: `/demo-registration` file upload still works

3. **3A-2: Remove DataTable dead code**
   - Delete `packages/core/src/primitives/data-table.tsx`
   - Remove export from `packages/core/src/primitives/index.ts`
   - Verify: build passes

4. **3A-3: Add global search filter to GridToolbar**
   - Update `GridToolbar` component to accept `table` instance or filter props
   - Add search input that calls `table.setGlobalFilter()`
   - Ensure `SchemaGrid` passes the table instance to `GridToolbar`
   - Verify: `/demo-grid` toolbar has working search

5. **3A-4: Move onCancel from FormSchema to SchemaFormProps**
   - Remove `onCancel` from `FormSchema` in `types.ts`
   - Add `onCancel` to `SchemaFormProps` in `schema-form.tsx`
   - Update `SerializableFormSchema` in `server/schemas.ts` (simplify or remove the Omit)
   - Update routes that use `schema.onCancel` to pass it as a prop
   - Verify: Cancel button on `/demo-registration` and `/demo-support-ticket` still works

6. **3A-5: Implement bordered grid style**
   - Update `applyGridStyles()` in `schema-grid.tsx` to handle `bordered` prop
   - Add appropriate border CSS classes when `bordered === true`
   - Verify: set `bordered: true` in a mock schema and check rendering

7. **3A-6: Export missing types from engine index**
   - Export `ValidationRule`, `FieldCondition`, `FileUploadConfig`, `StatusConfig`, `StatusVariant` from `engine/index.ts`
   - Verify: build passes

8. **3A-7: Decide on AddressInput**
   - Recommendation: Keep file but add a `NOTE:` comment marking it as "available for future use, not wired to engine"
   - No engine changes needed at this time

### Phase 3B — Production Features (in order)

9. **3B-1: Accessibility — ARIA attributes on form fields**
   - Add `aria-required` to required fields in `FieldRenderer`
   - Add `aria-invalid` when validation fails
   - Add `aria-describedby` linking to error messages
   - Verify: inspect DOM on `/demo-form`

10. **3B-2: Accessibility — ARIA attributes on grid**
    - Add `role="grid"`, `role="row"`, `role="gridcell"`, `role="columnheader"` in `SchemaGrid`
    - Add `aria-sort` in `GridColumnHeader`
    - Add ARIA labels on pagination buttons in `GridPagination`
    - Verify: inspect DOM on `/demo-grid`

11. **3B-3: Server-side pagination support**
    - Add `ServerPaginationConfig` to `types.ts`
    - Update `SchemaGrid` to accept `onPageChange` prop
    - When `serverPagination` is configured, switch TanStack Table to manual pagination mode
    - Update `GridPagination` to work with server-side mode
    - Update mock schemas to demonstrate server pagination
    - Verify: create test route or update `/demo-grid` with server pagination demo

12. **3B-4: Theme customization**
    - Create `theme-provider.tsx` with `ThemeConfig` interface and context
    - `ThemeConfig` allows overriding default CSS class names for components
    - Export `ThemeProvider` and `useTheme` from engine index
    - Integrate theme lookups in `SchemaGrid` and `SchemaForm` renderers
    - Verify: wrap showcase in ThemeProvider and confirm overrides apply

13. **3B-5: Internationalization (i18n)**
    - Add `I18nConfig` interface to `types.ts`
    - Create `helpers/i18n.ts` with `resolveMessage()` function
    - Replace all hardcoded strings in renderers with `resolveMessage()` calls:
      - SchemaGrid: empty message
      - SchemaForm: submit label, cancel label
      - GridPagination: "Previous", "Next", "of", "rows"
      - GridToolbar: "Search...", "Columns"
    - Add `i18n` field to `FormSchema` and `GridSchema`
    - Verify: pass `i18n` config with overridden messages and confirm rendering

14. **3B-6: CI/CD Pipeline**
    - Create `.github/workflows/ci.yml` with:
      - Trigger on push/PR to main
      - Steps: checkout, setup pnpm, install, build, type-check
    - Create `.github/workflows/publish.yml` with:
      - Trigger on tag publish (v*)
      - Steps: checkout, setup pnpm, install, build, npm publish
    - Verify: push branch and check GitHub Actions runs

15. **Update Documentation**
    - Update `docs/ARCHITECTURE.md`:
      - Phase 3 status → mark completed items
      - Document new interfaces (ThemeConfig, I18nConfig, ServerPaginationConfig)
      - Document `onCancel` migration
      - Document accessibility compliance
    - Verify: documentation matches implementation

16. **Final Validation**
    - Run `pnpm run build` — must pass with zero errors
    - Run `pnpm dev` — all routes must render correctly
    - Verify no TypeScript errors in IDE
    - Commit and push for PR review