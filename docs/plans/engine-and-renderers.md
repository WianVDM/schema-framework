# Implementation Plan: Engine, Renderers & State Management

[Overview]
Implement the complete data-driven UI engine (Phase 1 Steps 2–5 of ARCHITECTURE.md Section 7) plus the state management layer (Section 4), progressing from schema types through form rendering, grid rendering, and ending with TanStack Query/Zustand integration.

The monorepo scaffolding (Phase 1 Step 1) is complete. The `packages/core` package builds successfully but contains only empty barrel exports. The `apps/showcase` app runs with TanStack Start file-based routing and has shadcn/ui initialized (only `button` component). The demo route (`/demo`) imports a non-existent `FieldSchema` type and renders a static JSON preview with hardcoded HTML form elements. This plan transforms that skeleton into a working schema-driven engine where JSON schemas are consumed by renderers that produce real, interactive forms and grids — all while respecting the 3-Layer Architecture and the Shadcn Dependency Rule.

[Types]

### Core Schema Types — `packages/core/src/engine/types.ts`

**`FieldType`** (union type):
```typescript
type FieldType = 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date' | 'password';
```

**`SelectOption`** (interface):
```typescript
interface SelectOption {
  label: string;
  value: string;
}
```

**`ValidationRule`** (interface):
```typescript
interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom';
  value?: string | number;
  message: string;
}
```

**`FieldSchema`** (interface):
```typescript
interface FieldSchema {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  defaultValue?: unknown;
  disabled?: boolean;
  options?: string[] | SelectOption[];
  validation?: ValidationRule[];
  colSpan?: number;
  description?: string;
}
```

**`FormSchema`** (interface):
```typescript
interface FormSchema {
  title?: string;
  description?: string;
  fields: FieldSchema[];
  submitLabel?: string;
  layout?: 'stack' | 'grid';
}
```

**`GridColumnSchema`** (interface):
```typescript
interface GridColumnSchema {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'status';
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}
```

**`GridSchema`** (interface):
```typescript
interface GridSchema {
  title?: string;
  description?: string;
  columns: GridColumnSchema[];
  dataKey: string;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  emptyMessage?: string;
}
```

**`PrimitiveComponents`** (interface — for PrimitivesContext):
```typescript
interface PrimitiveComponents {
  Input: React.ComponentType<Record<string, unknown>>;
  Select: React.ComponentType<Record<string, unknown>>;
  Option: React.ComponentType<Record<string, unknown>>;
  Label: React.ComponentType<Record<string, unknown>>;
  Textarea: React.ComponentType<Record<string, unknown>>;
  Checkbox: React.ComponentType<Record<string, unknown>>;
  Table: React.ComponentType<Record<string, unknown>>;
  TableHeader: React.ComponentType<Record<string, unknown>>;
  TableBody: React.ComponentType<Record<string, unknown>>;
  TableRow: React.ComponentType<Record<string, unknown>>;
  TableHead: React.ComponentType<Record<string, unknown>>;
  TableCell: React.ComponentType<Record<string, unknown>>;
  Button: React.ComponentType<Record<string, unknown>>;
}
```

**`FormSubmitHandler`** (type):
```typescript
type FormSubmitHandler = (values: Record<string, unknown>) => void | Promise<void>;
```

**`SelectionStore`** (generic interface — per ARCHITECTURE.md Appendix C):
```typescript
interface SelectionStore<T = unknown> {
  selectedId: string | null;
  selectedData: T | null;
  setSelected: (id: string, data: T) => void;
  clearSelection: () => void;
}
```

[Files]

### New Files to Create

**Layer 2 — Engine Types & Validation:**
- `packages/core/src/engine/types.ts` — All TypeScript interfaces/types listed above (FieldType, FieldSchema, FormSchema, GridColumnSchema, GridSchema, PrimitiveComponents, ValidationRule, SelectOption, FormSubmitHandler).
- `packages/core/src/engine/validators.ts` — Zod schemas (`zFieldSchema`, `zFormSchema`, `zGridColumnSchema`, `zGridSchema`) that mirror the TypeScript types for runtime validation of incoming JSON from backends.

**Layer 2 — PrimitivesContext:**
- `packages/core/src/engine/context/primitives-context.tsx` — React Context + Provider + `usePrimitives()` hook. The `PrimitivesProvider` accepts a `PrimitiveComponents` object and makes it available to all renderers via context.

**Layer 2 — Renderers:**
- `packages/core/src/engine/renderers/field-renderer.tsx` — The "switchboard" component. Takes a single `FieldSchema` + `value` + `onChange` + `error` and delegates to the appropriate primitive via `usePrimitives()`. Handles: text, email, number, password, textarea, select, checkbox, date.
- `packages/core/src/engine/renderers/schema-form.tsx` — Main form renderer. Takes `FormSchema` + `onSubmit` + optional `initialValues`. Manages form state (values, errors, touched, dirty) internally using React `useState`. Iterates `schema.fields` and renders a `FieldRenderer` for each. Includes a submit button.
- `packages/core/src/engine/renderers/schema-grid.tsx` — Grid renderer. Takes `GridSchema` + `data` (array of row objects). Uses primitives (Table, TableHeader, TableBody, TableRow, TableHead, TableCell) from context to build the table. Supports column sorting (client-side).
- `packages/core/src/engine/renderers/index.ts` — Barrel export for all renderers.

**Layer 3 — Showcase Mock Data:**
- `apps/showcase/src/data/mock-schemas.ts` — Hardcoded JSON objects: a `FormSchema` for a "User Registration" form, a `GridSchema` for a "Shipments" grid, and matching mock row data.
- `apps/showcase/src/data/primitive-mappings.tsx` — Maps shadcn/ui components to the `PrimitiveComponents` interface. Single source of truth for the PrimitivesProvider wiring.

**Layer 3 — Showcase Routes:**
- `apps/showcase/src/routes/demo-form.tsx` — Route demonstrating `SchemaForm` with mock form schema.
- `apps/showcase/src/routes/demo-grid.tsx` — Route demonstrating `SchemaGrid` with mock grid schema + data.

**Layer 3 — Showcase PrimitivesProvider:**
- `apps/showcase/src/app/primitives-provider.tsx` — Wraps children with `PrimitivesProvider` passing shadcn components. Used inside `__root.tsx`.

**Layer 3 — State Management:**
- `apps/showcase/src/stores/selection-store.ts` — Generic Zustand store factory implementing `SelectionStore<T>` from ARCHITECTURE.md Appendix C.

### Existing Files to Modify

- `packages/core/src/engine/index.ts` — Change from `export {}` to re-export everything from `types.ts`, `validators.ts`, `context/`, and `renderers/`.
- `packages/core/src/primitives/index.ts` — Add a comment noting that Layer 1 primitives are currently empty by design; the framework uses shadcn components passed via PrimitivesContext (per Shadcn Dependency Rule).
- `packages/core/src/index.ts` — Ensure it re-exports from both `./primitives` and `./engine` (currently does this, but needs updating once engine has real exports).
- `packages/core/package.json` — Add `zod` as a dependency (validators), add `@tanstack/react-table` as a peerDependency (for future grid enhancements).
- `apps/showcase/src/routes/demo.tsx` — Replace static rendering with actual `SchemaForm` usage powered by the engine.
- `apps/showcase/src/routes/__root.tsx` — Wrap the `<Outlet />` with `PrimitivesProvider` from the new provider file (or import it).
- `apps/README.md` — No change needed unless new routes require it.

### shadcn Components to Install

Run inside `apps/showcase/`:
- `npx shadcn@latest add input` — For text/email/number/password fields
- `npx shadcn@latest add select` — For select fields (installs Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel)
- `npx shadcn@latest add label` — For field labels
- `npx shadcn@latest add textarea` — For textarea fields
- `npx shadcn@latest add checkbox` — For checkbox fields
- `npx shadcn@latest add table` — For grid rendering (installs Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption, TableFooter)
- `npx shadcn@latest add form` — For potential shadcn Form integration (optional, may use own form state)

[Functions]

### New Functions

- **`createPrimitivesContext()`** — File: `packages/core/src/engine/context/primitives-context.tsx`. Signature: `() => React.Context<PrimitiveComponents | null>`. Purpose: Creates the React context for primitive component injection (internal).

- **`PrimitivesProvider`** — File: `packages/core/src/engine/context/primitives-context.tsx`. Signature: `(props: { primitives: PrimitiveComponents; children: React.ReactNode }) => JSX.Element`. Purpose: Context provider that makes shadcn component mappings available to all engine renderers.

- **`usePrimitives()`** — File: `packages/core/src/engine/context/primitives-context.tsx`. Signature: `() => PrimitiveComponents`. Purpose: Hook consumed by renderers to access the injected primitives. Throws a descriptive error if used outside `PrimitivesProvider`.

- **`FieldRenderer`** — File: `packages/core/src/engine/renderers/field-renderer.tsx`. Signature: `(props: FieldRendererProps) => JSX.Element` where `FieldRendererProps = { schema: FieldSchema; value: unknown; onChange: (value: unknown) => void; error?: string }`. Purpose: Switchboard that reads `schema.type` and renders the correct primitive component (Input, Select, Textarea, Checkbox, etc.) with appropriate props.

- **`SchemaForm`** — File: `packages/core/src/engine/renderers/schema-form.tsx`. Signature: `(props: SchemaFormProps) => JSX.Element` where `SchemaFormProps = { schema: FormSchema; onSubmit: FormSubmitHandler; initialValues?: Record<string, unknown>; }`. Purpose: Top-level form renderer that manages field values, validation errors, renders FieldRenderer per field, and handles form submission.

- **`SchemaGrid`** — File: `packages/core/src/engine/renderers/schema-grid.tsx`. Signature: `(props: SchemaGridProps) => JSX.Element` where `SchemaGridProps = { schema: GridSchema; data: Record<string, unknown>[] }`. Purpose: Grid renderer that builds an HTML table from schema columns and row data using injected table primitives.

- **`validateField(field, value)`** — File: `packages/core/src/engine/validators.ts`. Signature: `(field: FieldSchema, value: unknown) => string | null`. Purpose: Validates a single field value against its `ValidationRule[]` and returns an error message or null.

- **`validateForm(fields, values)`** — File: `packages/core/src/engine/validators.ts`. Signature: `(fields: FieldSchema[], values: Record<string, unknown>) => Record<string, string>`. Purpose: Validates all fields in a form and returns a map of field names to error messages.

- **`parseFormSchema(json)`** — File: `packages/core/src/engine/validators.ts`. Signature: `(json: unknown) => FormSchema`. Purpose: Runtime Zod validation of incoming JSON. Throws `ZodError` with human-readable issues if invalid.

- **`parseGridSchema(json)`** — File: `packages/core/src/engine/validators.ts`. Signature: `(json: unknown) => GridSchema`. Purpose: Runtime Zod validation of grid schema JSON.

- **`createSelectionStore`** — File: `apps/showcase/src/stores/selection-store.ts`. Signature: `<T>() => UseBoundStore<StoreApi<SelectionStore<T>>>`. Purpose: Zustand store factory that produces a typed selection store per ARCHITECTURE.md Appendix C.

### Modified Functions

- **`DemoPage`** — File: `apps/showcase/src/routes/demo.tsx`. Current: renders static JSON preview + hardcoded HTML form. Change: import `SchemaForm` from `@my-framework/core`, pass mock `FormSchema` + `onSubmit` handler, replace all static rendering with the engine-driven form.

### Removed Functions

None. All existing functions remain, only `DemoPage` is significantly refactored.

[Classes]

No classes are created. All components are function components with hooks. The only class-like construct is the Zustand store created by `create`, which is a hook, not a class.

[Dependencies]

### New Packages for `packages/core`

- `zod`: `^3.24` — Runtime schema validation (move from showcase to core, or add to core). Added as a direct dependency since the engine's validators live here.

### New Packages for `apps/showcase`

- `zustand`: `^5` — Lightweight state management for selection stores (per ARCHITECTURE.md Section 4).
- `@tanstack/react-table`: `^8` — Headless table library for advanced grid features (sorting, pagination, filtering). NOTE: The initial SchemaGrid will use primitive table components directly. `@tanstack/react-table` integration is a Phase 2 enhancement, but installing it now prepares for that.

### shadcn CLI Installations (inside `apps/showcase/`)

These pull in their own sub-dependencies (already handled by shadcn):
- `input`, `select`, `label`, `textarea`, `checkbox`, `table`

[Testing]

No automated test framework is configured yet. Validation is performed by:

1. **Build verification:** `pnpm run build` completes with zero TypeScript errors across both `packages/core` and `apps/showcase`.
2. **Dev server verification:** `pnpm run dev` starts the showcase. Navigate to `/demo` and see a real, interactive SchemaForm (not a static JSON preview). Navigate to `/demo-form` and `/demo-grid` to see dedicated demonstrations.
3. **Runtime validation:** The `parseFormSchema()` function correctly rejects malformed JSON and accepts valid schemas.
4. **Form interaction:** Typing in fields updates state. Clicking submit logs values to console. Validation errors display inline when rules are violated.
5. **Grid rendering:** The `/demo-grid` route displays a table with mock shipment data, column headers matching the grid schema, and clickable rows that update the Zustand selection store.

Per **Workflow E** (workspace-workflows.md), the task is NOT done if there are unhandled TypeScript errors in the terminal output.

[Implementation Order]

1. **Add `zod` dependency to `packages/core`:** Update `packages/core/package.json` to include `zod` as a dependency.
2. **Define schema types:** Create `packages/core/src/engine/types.ts` with all interfaces (FieldType, FieldSchema, FormSchema, GridColumnSchema, GridSchema, PrimitiveComponents, ValidationRule, SelectOption, FormSubmitHandler).
3. **Create Zod validators:** Create `packages/core/src/engine/validators.ts` with `zFieldSchema`, `zFormSchema`, `zGridColumnSchema`, `zGridSchema`, `parseFormSchema()`, `parseGridSchema()`, `validateField()`, `validateForm()`.
4. **Create PrimitivesContext:** Create `packages/core/src/engine/context/primitives-context.tsx` with `PrimitivesProvider`, `usePrimitives()`, and the `PrimitiveComponents` interface (imported from types).
5. **Create FieldRenderer:** Create `packages/core/src/engine/renderers/field-renderer.tsx`. Handles: text, email, number, password → `Input`; select → `Select`; textarea → `Textarea`; checkbox → `Checkbox`; date → `Input type="date"`. Each uses `usePrimitives()` to get the component.
6. **Create SchemaForm:** Create `packages/core/src/engine/renderers/schema-form.tsx`. Manages form state with `useState`, renders `FieldRenderer` per field, validates on submit, calls `onSubmit` with values.
7. **Create SchemaGrid:** Create `packages/core/src/engine/renderers/schema-grid.tsx`. Takes `GridSchema` + data array, renders table using primitives from context. Supports basic client-side column sorting.
8. **Create renderers barrel export:** Create `packages/core/src/engine/renderers/index.ts` exporting `FieldRenderer`, `SchemaForm`, `SchemaGrid`.
9. **Update engine barrel:** Update `packages/core/src/engine/index.ts` to re-export from `types.ts`, `validators.ts`, `context/`, and `renderers/`.
10. **Install shadcn components:** Run `npx shadcn@latest add input select label textarea checkbox table` inside `apps/showcase/`.
11. **Install Zustand:** Run `pnpm add zustand` inside `apps/showcase/`.
12. **Create primitive mappings:** Create `apps/showcase/src/data/primitive-mappings.tsx` that maps all installed shadcn components to the `PrimitiveComponents` interface.
13. **Create PrimitivesProvider wrapper:** Create `apps/showcase/src/app/primitives-provider.tsx` that wraps children with `PrimitivesProvider` using the mappings.
14. **Create mock schemas:** Create `apps/showcase/src/data/mock-schemas.ts` with a mock FormSchema (User Registration) and mock GridSchema (Shipments) + mock data rows.
15. **Update root layout:** Modify `apps/showcase/src/routes/__root.tsx` to wrap `<Outlet />` with `PrimitivesProvider` from the new provider file.
16. **Create demo-form route:** Create `apps/showcase/src/routes/demo-form.tsx` using `SchemaForm` with the mock form schema. Wire `onSubmit` to `console.log`.
17. **Create demo-grid route:** Create `apps/showcase/src/routes/demo-grid.tsx` using `SchemaGrid` with the mock grid schema + data.
18. **Update demo route:** Refactor `apps/showcase/src/routes/demo.tsx` to use `SchemaForm` instead of static rendering.
19. **Create selection store:** Create `apps/showcase/src/stores/selection-store.ts` with Zustand store factory per ARCHITECTURE.md Appendix C. Wire into the grid demo (row click updates store).
20. **Update root layout navigation:** Add links to `/demo-form` and `/demo-grid` in the root layout nav.
21. **Build verification:** Run `pnpm run build` to ensure zero TypeScript errors across the monorepo.
22. **Dev server verification:** Run `pnpm run dev` and visually verify all routes work correctly.