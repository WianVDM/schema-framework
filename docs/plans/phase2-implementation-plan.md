# Implementation Plan: Phase 2 — Complete Data-Driven UI Framework

[Overview]
Complete all outstanding Phase 2 items from ARCHITECTURE.md by breaking them into focused sub-phases for higher code quality and clearer context boundaries.

Phase 1 established the foundational 3-layer architecture with basic SchemaForm (8 field types) and SchemaGrid (sorting only). Phase 2 transforms this into an enterprise-grade framework by adding advanced grid capabilities (pagination, filtering, column resizing, visibility), bespoke Layer 1 primitives (DataTable, StatusBadge, AddressInput), schema-driven conditional visibility with field dependencies, and a file upload field type. The plan also addresses gaps discovered during investigation: GridSchema properties (striped/bordered/hoverable) that are defined but never consumed, colSpan that is defined but not applied, and the status column type that renders as plain text. All work targets the `feat/phase2-complete` branch. CI/CD pipeline and theme customization are excluded as they are separate infrastructure concerns.

[Types]

Schema type changes across `packages/core/src/engine/types.ts` and corresponding Zod validators in `packages/core/src/engine/validators.ts`.

### New Types Added to `FieldType` Union
```typescript
// Added to existing FieldType union
'file'
```

### New Interface: `PaginationConfig`
```typescript
interface PaginationConfig {
  pageSize: number              // Default: 10
  pageSizeOptions?: number[]    // e.g. [10, 25, 50, 100]
  showPageSizeSelector?: boolean
}
```

### New Interface: `ColumnFilterConfig`
```typescript
interface ColumnFilterConfig {
  enabled: boolean
  placeholder?: string          // Default: "Filter..."
}
```

### Modified Interface: `GridColumnSchema` (additions only)
```typescript
// Added to existing GridColumnSchema
filterable?: boolean
resizable?: boolean
visible?: boolean               // Default: true
filter?: ColumnFilterConfig
```

### Modified Interface: `GridSchema` (additions only)
```typescript
// Added to existing GridSchema
pagination?: PaginationConfig | boolean   // false = no pagination
filterable?: boolean                       // Global filter toggle
resizable?: boolean                        // Global column resize toggle
columnVisibility?: Record<string, boolean> // Default column visibility map
```

### Modified Interface: `FieldSchema` (additions only)
```typescript
// Added to existing FieldSchema
visibleWhen?: FieldCondition    // Show/hide based on other field values
dependsOn?: string[]            // List of field names this field depends on
```

### New Interface: `FieldCondition`
```typescript
interface FieldCondition {
  field: string                              // Name of the controlling field
  operator: 'equals' | 'notEquals' | 'in' | 'notIn' | ' truthy' | 'falsy'
  value?: string | number | boolean | (string | number)[]
}
```

### New Interface: `FileUploadConfig`
```typescript
interface FileUploadConfig {
  accept?: string               // MIME types, e.g. "image/*,.pdf"
  maxSize?: number              // Max file size in bytes
  multiple?: boolean            // Allow multiple file selection
}
```

### Modified Interface: `FieldSchema` (for file type)
```typescript
// Added to existing FieldSchema
fileConfig?: FileUploadConfig
```

### New Interface: `StatusConfig`
```typescript
interface StatusConfig {
  variants: Record<string, { label: string; className: string }>
  // e.g. { admin: { label: "Admin", className: "bg-red-100 text-red-800" } }
}
```

### Modified Interface: `PrimitiveComponents` (additions)
```typescript
// Added to existing PrimitiveComponents for new features
Badge: ComponentType<Record<string, unknown>>
Dialog: ComponentType<Record<string, unknown>>
DialogContent: ComponentType<Record<string, unknown>>
DialogTrigger: ComponentType<Record<string, unknown>>
DropdownMenu: ComponentType<Record<string, unknown>>
DropdownMenuTrigger: ComponentType<Record<string, unknown>>
DropdownMenuContent: ComponentType<Record<string, unknown>>
DropdownMenuItem: ComponentType<Record<string, unknown>>
```

[Files]

All file modifications organized by sub-phase. New files marked with `[NEW]`, modified files with `[MOD]`.

### Branch Setup
- Create branch `feat/phase2-complete` from `main`

### Sub-Phase 2A: Advanced Grid Features

**`packages/core/src/engine/types.ts`** [MOD]
- Add `PaginationConfig`, `ColumnFilterConfig` interfaces
- Add `filterable`, `resizable`, `visible`, `filter` to `GridColumnSchema`
- Add `pagination`, `filterable`, `resizable`, `columnVisibility` to `GridSchema`

**`packages/core/src/engine/validators.ts`** [MOD]
- Add Zod schemas for `PaginationConfig`, `ColumnFilterConfig`
- Update `gridColumnSchemaValidator` with new optional fields
- Update `gridSchemaValidator` with new optional fields

**`packages/core/src/engine/renderers/schema-grid.tsx`** [MOD] — Major refactor
- Add `@tanstack/react-table` pagination model (`getPaginationRowModel`)
- Add column filtering UI (input per column header)
- Add column resizing via TanStack Table `columnResizeMode`
- Add column visibility toggle dropdown
- Apply `striped`, `bordered`, `hoverable` CSS classes from `GridSchema`
- Render `status` column type using injected `Badge` component from PrimitivesContext
- Add pagination controls bar (page buttons, page size selector)

**`packages/core/src/engine/renderers/grid-pagination.tsx`** [NEW]
- Extracted pagination controls component
- Consumes TanStack Table instance
- Renders prev/next buttons, page numbers, page size selector

**`packages/core/src/engine/renderers/grid-column-header.tsx`** [NEW]
- Extracted column header with sort indicator + filter input
- Handles the sort button and inline filter text input

**`packages/core/src/engine/renderers/grid-toolbar.tsx`** [NEW]
- Column visibility toggle dropdown
- Grid-level toolbar for density, column settings

**`apps/showcase/src/data/mock-schemas.ts`** [MOD]
- Update `userGridSchema` with pagination config, filterable columns, resizable
- Add more mock users (20+ rows) to demonstrate pagination

**`apps/showcase/src/routes/demo-grid.tsx`** [MOD]
- Wire up the expanded grid features

### Sub-Phase 2B: Bespoke Primitives

**`packages/core/src/primitives/data-table.tsx`** [NEW]
- Generic `DataTable` component wrapping shadcn Table
- Built-in pagination, empty state, loading skeleton
- Accepts standard TanStack Table options
- Knows nothing about schemas (Layer 1 rule)

**`packages/core/src/primitives/status-badge.tsx`** [NEW]
- Generic `StatusBadge` component
- Accepts `variant` and `label` props
- Maps variant → CSS classes for color coding
- Knows nothing about schemas (Layer 1 rule)

**`packages/core/src/primitives/address-input.tsx`** [NEW]
- Composite address input (street, city, state, zip, country)
- Each sub-field is a standard controlled input
- Accepts `value: AddressData` and `onChange: (value: AddressData) => void`
- Knows nothing about schemas (Layer 1 rule)

**`packages/core/src/primitives/index.ts`** [MOD]
- Export `DataTable`, `StatusBadge`, `AddressInput`

**`packages/core/src/engine/types.ts`** [MOD]
- Add `StatusConfig` interface
- Add `statusConfig` to `GridColumnSchema`

**`packages/core/src/engine/renderers/schema-grid.tsx`** [MOD]
- Use `StatusBadge` for `type: 'status'` columns
- Use `DataTable` as the underlying table wrapper

### Sub-Phase 2C: Schema-Driven Layout Rules

**`packages/core/src/engine/types.ts`** [MOD]
- Add `FieldCondition` interface
- Add `visibleWhen` and `dependsOn` to `FieldSchema`

**`packages/core/src/engine/validators.ts`** [MOD]
- Add Zod schema for `FieldCondition`
- Update `fieldSchemaValidator` with `visibleWhen` and `dependsOn`

**`packages/core/src/engine/renderers/schema-form.tsx`** [MOD]
- Add `evaluateCondition` helper to check `FieldCondition` against current form values
- Watch dependent fields via TanStack Form's `form.useStore` or `form.Subscribe`
- Conditionally show/hide fields based on `visibleWhen` evaluation
- Apply `colSpan` styling (currently defined but not consumed by grid layout)

**`apps/showcase/src/data/mock-schemas.ts`** [MOD]
- Add a new `advancedFormSchema` with conditional visibility examples:
  - Show "Company Name" when "Customer Type" = "business"
  - Show "Delivery Instructions" when "Shipping Method" = "custom"
  - Show "Account Number" when "Payment Type" = "credit"

**`apps/showcase/src/routes/demo-form.tsx`** [MOD]
- Add toggle to switch between basic and advanced form schemas

### Sub-Phase 2D: File Upload Field Type

**`packages/core/src/engine/types.ts`** [MOD]
- Add `'file'` to `FieldType` union
- Add `FileUploadConfig` interface
- Add `fileConfig` to `FieldSchema`

**`packages/core/src/engine/validators.ts`** [MOD]
- Add `'file'` to `fieldTypeSchema` enum
- Add Zod schema for `FileUploadConfig`
- Update `fieldSchemaValidator` with `fileConfig`

**`packages/core/src/primitives/file-upload.tsx`** [NEW]
- Generic file upload component (Layer 1)
- Drag-and-drop zone styling
- Accept, maxSize, multiple props
- File list display with remove buttons
- Knows nothing about schemas (Layer 1 rule)

**`packages/core/src/primitives/index.ts`** [MOD]
- Export `FileUpload`

**`packages/core/src/engine/renderers/field-renderer.tsx`** [MOD]
- Add `case 'file'` rendering block using injected file upload component

**`apps/showcase/src/data/mock-schemas.ts`** [MOD]
- Add file upload field to `contactFormSchema` or create new demo schema

### Sub-Phase 2E: Gap Fixes & Showcase Polish

**`packages/core/src/engine/renderers/schema-grid.tsx`** [MOD]
- Apply `striped`, `bordered`, `hoverable` CSS class logic (if not done in 2A)
- Add loading skeleton state when data is fetching
- Ensure `width` on columns is properly applied as pixel widths

**`packages/core/src/engine/renderers/schema-form.tsx`** [MOD]
- Apply `colSpan` to grid layout (if not done in 2C)
- Add form reset/cancel button support

**`packages/core/src/engine/types.ts`** [MOD]
- Add `cancelLabel` and `onCancel` to `FormSchema` / `SchemaFormProps`

**`apps/showcase/src/routes/demo-grid-advanced.tsx`** [NEW]
- Dedicated route showcasing all grid features: pagination, filtering, resizing, column visibility, status badges

**`apps/showcase/src/routes/demo-form-advanced.tsx`** [NEW]
- Dedicated route showcasing conditional visibility and file upload

**`apps/showcase/src/routes/__root.tsx`** [MOD]
- Add navigation links for new demo routes

**`apps/showcase/src/data/primitive-mappings.tsx`** [MOD]
- Add Badge, Dialog, DropdownMenu mappings for new primitives

**`apps/showcase/src/components/ui/badge.tsx`** — already exists
**`apps/showcase/src/components/ui/dropdown-menu.tsx`** [NEW] — shadcn add
**`apps/showcase/src/components/ui/dialog.tsx`** [NEW] — shadcn add

**`apps/showcase/src/server/schemas.ts`** [MOD]
- Add server functions for new demo schemas

**`apps/showcase/src/server/data.ts`** [MOD]
- Add server function for expanded mock data

**`docs/ARCHITECTURE.md`** [MOD]
- Update Phase 2 section: mark completed items
- Update Implemented Field Types table with `file`
- Add Phase 2A-2E completion status
- Update Section 3 folder structure to reflect new files

[Functions]

### New Functions

**`evaluateCondition(condition: FieldCondition, formValues: Record<string, unknown>): boolean`**
- File: `packages/core/src/engine/renderers/schema-form.tsx`
- Purpose: Evaluates a `FieldCondition` against current form values to determine visibility
- Returns `true` if the condition is met (field should be visible)

**`formatCellValue(col: GridColumnSchema, value: unknown): ReactNode`** (refactored from string return)
- File: `packages/core/src/engine/renderers/schema-grid.tsx`
- Purpose: Format cell values, returning `ReactNode` for status badge rendering instead of plain string
- Change: Return type changes from `string` to `ReactNode` to support Badge components

**`applyGridStyles(schema: GridSchema): string`** (new helper)
- File: `packages/core/src/engine/renderers/schema-grid.tsx`
- Purpose: Computes CSS classes from `striped`, `bordered`, `hoverable` schema properties

### Modified Functions

**`SchemaGrid`** — Major refactor
- File: `packages/core/src/engine/renderers/schema-grid.tsx`
- Add pagination state (`useState<PaginationState>`)
- Add column filter state (`useState<ColumnFiltersState>`)
- Add column visibility state (`useState<VisibilityState>`)
- Add column sizing state
- Wire `getPaginationRowModel`, `getFilteredRowModel`
- Apply grid CSS from schema props

**`SchemaForm`** — Moderate refactor
- File: `packages/core/src/engine/renderers/schema-form.tsx`
- Track `visibleFields` computed from `visibleWhen` conditions + current form values
- Filter `schema.fields` before rendering to only show visible fields
- Apply `colSpan` via style prop on field wrappers

**`FieldRenderer`** — Small addition
- File: `packages/core/src/engine/renderers/field-renderer.tsx`
- Add `case 'file'` block

**`validateFieldValue`** — Minor update
- File: `packages/core/src/engine/validators.ts`
- Add file validation support (maxSize, accept type checking)

[Classes]

No new classes. The architecture uses functional React components and TypeScript interfaces. All new components are functional components following existing patterns.

[Dependencies]

### New npm Packages (apps/showcase only)

**`@tanstack/react-table`** — Already installed, no change needed. Uses `getPaginationRowModel`, `getFilteredRowModel` which are included in the existing package.

**`lucide-react`** — Already installed. Will use icons for pagination, column visibility, file upload.

### shadcn/ui Components to Add (apps/showcase)

```bash
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
```

- `dropdown-menu` — Used for column visibility toggle and grid toolbar
- `dialog` — Used for file preview or grid settings modal
- `badge` — Already installed, used for status column rendering

### No New Dependencies for packages/core

The core package already has all needed peer dependencies (`@tanstack/react-table`, `@tanstack/react-form`, `react`, `zod`). New features use existing APIs from these packages.

[Testing]

### Manual Testing Approach

Since no automated test infrastructure exists yet (testing framework not configured), all testing is manual via the dev server.

**Validation Commands:**
```bash
pnpm run build          # Must complete with zero TypeScript errors
pnpm dev                # All routes must render without console errors
```

### Test Matrix

**Grid Features (Sub-Phase 2A):**
- [ ] Grid renders with pagination controls
- [ ] Page size selector changes number of visible rows
- [ ] Column filter inputs filter data in real-time
- [ ] Columns can be resized by dragging column borders
- [ ] Column visibility dropdown shows/hides columns
- [ ] `striped`, `bordered`, `hoverable` classes apply correctly
- [ ] Status columns render with colored badges
- [ ] Empty state message displays when no data matches filter
- [ ] Pagination resets when filters change

**Primitives (Sub-Phase 2B):**
- [ ] DataTable renders with built-in pagination
- [ ] StatusBadge renders with correct variant colors
- [ ] AddressInput collects all sub-fields correctly

**Layout Rules (Sub-Phase 2C):**
- [ ] Fields with `visibleWhen` appear/disappear based on dependent field values
- [ ] Changing controlling field immediately shows/hides dependent fields
- [ ] `colSpan` is applied in grid layout
- [ ] Form validation skips hidden fields

**File Upload (Sub-Phase 2D):**
- [ ] File dropzone renders and accepts files
- [ ] File type validation works (accept prop)
- [ ] File size validation works (maxSize prop)
- [ ] Multiple file selection works when enabled
- [ ] File list displays with remove buttons

**Showcase Routes (Sub-Phase 2E):**
- [ ] All new routes accessible from navigation
- [ ] Advanced grid demo shows all grid features
- [ ] Advanced form demo shows conditional visibility + file upload
- [ ] No TypeScript errors in build output

[Implementation Order]

### Step 0: Branch Setup
1. Create branch `feat/phase2-complete` from `main`

### Step 1: Sub-Phase 2A — Advanced Grid Types & Validators
2. Update `packages/core/src/engine/types.ts` with `PaginationConfig`, `ColumnFilterConfig`, new `GridColumnSchema` and `GridSchema` fields
3. Update `packages/core/src/engine/validators.ts` with matching Zod schemas
4. Verify build passes with type changes only

### Step 2: Sub-Phase 2A — Grid Rendering (Pagination + Filtering)
5. Create `packages/core/src/engine/renderers/grid-pagination.tsx`
6. Create `packages/core/src/engine/renderers/grid-column-header.tsx`
7. Refactor `packages/core/src/engine/renderers/schema-grid.tsx` with pagination and filtering
8. Update `apps/showcase/src/data/mock-schemas.ts` with pagination config and more mock data
9. Verify: demo-grid route shows pagination controls

### Step 3: Sub-Phase 2A — Grid Rendering (Column Resizing + Visibility)
10. Create `packages/core/src/engine/renderers/grid-toolbar.tsx`
11. Add column resizing and visibility to schema-grid
12. Apply `striped`, `bordered`, `hoverable` CSS classes
13. Install shadcn dropdown-menu component in showcase
14. Verify: grid columns can be resized and toggled

### Step 4: Sub-Phase 2B — Bespoke Primitives
15. Create `packages/core/src/primitives/status-badge.tsx`
16. Create `packages/core/src/primitives/data-table.tsx`
17. Create `packages/core/src/primitives/address-input.tsx`
18. Update `packages/core/src/primitives/index.ts` exports
19. Add `StatusConfig` to types and validators
20. Integrate `StatusBadge` into schema-grid for status columns
21. Verify: status columns render with colored badges

### Step 5: Sub-Phase 2C — Layout Rules Engine
22. Add `FieldCondition` interface to types.ts
23. Add `visibleWhen` and `dependsOn` to `FieldSchema` and validators
24. Implement `evaluateCondition` in schema-form
25. Add conditional visibility logic to SchemaForm
26. Apply `colSpan` in grid layout
27. Create `advancedFormSchema` mock data with conditional examples
28. Verify: fields appear/disappear based on other field values

### Step 6: Sub-Phase 2D — File Upload
29. Add `'file'` to FieldType union and `FileUploadConfig` interface
30. Update validators with file type and config
31. Create `packages/core/src/primitives/file-upload.tsx`
32. Add `case 'file'` to FieldRenderer
33. Add file upload field to mock schemas
34. Verify: file upload renders and validates

### Step 7: Sub-Phase 2E — Showcase Polish & Gap Fixes
35. Create `apps/showcase/src/routes/demo-grid-advanced.tsx`
36. Create `apps/showcase/src/routes/demo-form-advanced.tsx`
37. Update `apps/showcase/src/routes/__root.tsx` navigation
38. Add new shadcn component mappings to `primitive-mappings.tsx`
39. Add server functions for new schemas/data
40. Add form cancel/reset support
41. Verify: all routes render, build passes with zero errors

### Step 8: Documentation Update
42. Update `docs/ARCHITECTURE.md` — Phase 2 completion status, new field types, updated structure

### Step 9: Final Validation
43. Run `pnpm run build` — zero TypeScript errors
44. Run `pnpm dev` — all routes render correctly
45. Verify all test matrix items pass