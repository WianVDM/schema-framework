# Architecture Blueprint: Data-Driven UI Framework

## 1. The Core Philosophy

We are not rebuilding Ext.NET's server-side component tree (React forbids this). Instead, we are extracting what made Ext.NET incredibly valuable for logistics: **Configurability** and **Data-Driven UI**.

In this framework, the C# backend (or any backend) owns the **Metadata** (JSON Schemas defining grids and forms), while the React frontend owns the **Rendering**. This allows screens to be modified per customer, permission, or workflow without deploying frontend code.

## 2. The 3-Layer Architecture

The framework relies on a strict, one-way dependency chain. A higher layer can import a lower layer, but never vice-versa.

### Layer 1: Primitives (The Raw Materials)

- **What it is:** Generic, highly reusable component wrappers. The primitives layer exports the `PrimitiveComponents` interface and a `PrimitivesContext` used to inject shadcn/ui components from Layer 3. Bespoke wrappers include `StatusBadge`, `AddressInput`, and `FileUpload`.
- **Rule:** These know nothing about JSON schemas. They just accept standard React props.

### Layer 2: The Engine (The "Ext.NET" Brain)

- **What it is:** The schema system. It contains the TypeScript interfaces defining what a schema is (`FieldSchema`, `GridColumnSchema`, `FieldCondition`, `StatusConfig`, etc.), the Zod validators, the `PrimitivesContext` provider, and the `SchemaForm`/`SchemaGrid` renderers.
- **How it works:** The `FieldRenderer` acts as a switchboard, reading a schema `type: 'select'` and rendering the injected `<Select>` component from `PrimitivesContext`. `SchemaGrid` uses `@tanstack/react-table` under the hood for sorting, filtering, pagination, column resizing, column visibility, and status badge rendering. `SchemaForm` uses `@tanstack/react-form` for field-level validation, dirty-state tracking, and conditional visibility. Helper renderers `GridPagination`, `GridColumnHeader`, and `GridToolbar` modularize grid concerns.

### Layer 3: Composition (The App/Showcase)

- **What it is:** The actual page files (TanStack Start file-based routes) and server functions (`createServerFn`).
- **How it works:** This layer fetches the JSON schema from mock TanStack server functions via `TanStack Query` (`useQuery`), fetches the actual business data the same way, and passes both into the Layer 2 Engine renderers. Zustand stores manage UI selection state.

## 3. The Monorepo Structure

```
schema-framework/                  # <- ONE SINGLE GIT REPO
├── apps/
│   └── showcase/                  # <- LAYER 3 (Composition)
│       ├── src/
│       │   ├── routes/            #     TanStack Start file-based routes
│       │   ├── server/            #     Mock TanStack server functions (schemas + data)
│       │   ├── data/              #     Static mock JSON schemas and data
│       │   ├── stores/            #     Zustand stores (selection state)
│       │   ├── lib/               #     Shared utilities (query-client, utils)
│       │   ├── app/               #     App-level config (CSS, primitives-provider)
│       │       ├── components/    #       shadcn/ui components (copy-pasted)
│       │       └── primitives-provider.tsx  # Wires shadcn → PrimitivesContext
│       │   └── client.tsx         #     Entry point
│       └── package.json           #     Depends on "@my-framework/core"
│
├── packages/
│   └── core/                      # <- LAYERS 1 & 2 (The npm library)
│       ├── src/
│       │   ├── primitives/        #     Layer 1: PrimitiveComponents interface, context
│       │   ├── engine/            #     Layer 2: Types, validators, renderers
│       │   │   ├── types.ts       #       FieldSchema, GridColumnSchema, etc.
│       │   │   ├── validators.ts  #       Zod schemas + validateFieldValue
│       │   │   ├── context/       #       PrimitivesContext (shadcn injection)
│       │   │   └── renderers/     #       SchemaForm, SchemaGrid, FieldRenderer
│       │   └── index.ts           #     Public API exports
│       └── package.json           #     Name: "@my-framework/core"
│
├── docs/                          #     Architecture docs and plans
│   ├── ARCHITECTURE.md            #     This file
│   └── plans/                     #     Implementation plans
├── pnpm-workspace.yaml            #     Links apps and packages
├── turbo.json                     #     Orchestrates builds
└── package.json
```

## 4. State Management Strategy

We replace the monolithic Ext JS "Store" with a modern, separated approach:

| Ext.NET Concept | Modern TanStack Equivalent | Purpose |
| :--- | :--- | :--- |
| **Store (Data)** | `TanStack Query` (`useQuery`) | Fetches and caches the actual business data (e.g., list of shipments). |
| **Store (Metadata)** | `TanStack Query` (`useQuery`) | Fetches the JSON Schema defining the UI layout. Treated as read-only. |
| **Store (Selection)** | **Zustand** (Global Store) | Tracks UI state (e.g., "Which row is currently clicked?"). Shared across sibling components. |
| **Store (Dirty State)** | **TanStack Form** (`useForm`) | Tracks if the user typed in a form field, handles validation, and knows exactly what changed. |
| **Table State (Sort/Page)** | **TanStack Table** (`useReactTable`) | Manages grid sorting, column visibility, and row model state. |

## 5. The "Shadcn Dependency" Rule

Because shadcn/ui is copy-pasted code (not an npm package), your `packages/core` library cannot hardcode import paths to shadcn files.

**The Solution:** A `PrimitivesContext` in Layer 2 that accepts all required UI components. The Showcase app (Layer 3) wraps the app in a provider that maps shadcn/ui components to the `PrimitiveComponents` interface.

```typescript
// packages/core/src/engine/context/primitives-context.tsx
// Defines PrimitiveComponents interface and PrimitivesContext

// packages/core/src/engine/renderers/schema-grid.tsx
// Consumes injected components:
import { usePrimitives } from '../context/primitives-context'

export function SchemaGrid({ schema, data, onRowClick }) {
  const { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } =
    usePrimitives()
  // render using these injected components
}

// apps/showcase/src/app/primitives-provider.tsx
// Layer 3 wires shadcn into the engine:
import { PrimitivesProvider } from '@my-framework/core'
import { Table, TableHeader, ... } from './components/ui/table'

export function AppPrimitivesProvider({ children }) {
  return (
    <PrimitivesProvider value={{ Table, TableHeader, ..., Button }}>
      {children}
    </PrimitivesProvider>
  )
}
```

This makes the framework agnostic to the end-user's specific shadcn theme or file structure.

## 6. Workflow & Lifecycle

### Local Development (Simultaneous)

1. You run `pnpm dev` in the root.
2. Turborepo creates a symlink: the Showcase app directly points to the Core package source code.
3. You edit `packages/core/src/engine/renderers/field-renderer.tsx`.
4. You hit save. The Showcase app instantly hot-reloads. Zero rebuilds required during development.

### Production Usage (Separation)

1. You finish a feature and push to the main branch.
2. GitHub Actions triggers.
3. It builds `packages/core` and publishes it to your private npm registry (e.g., `@my-framework/core@1.0.2`).
4. Later, you create a brand new Logistics App (`npx create-tanstack-start`).
5. You run `pnpm add @my-framework/core`.
6. You build your logistics app using the engine you built.

## 7. Phase 1 Status: COMPLETE ✅

All Phase 1 objectives have been implemented:

1. **✅ Scaffold the Monorepo:** pnpm workspace, Turborepo, TanStack Start with file-based routing, shadcn/ui initialized in showcase.
2. **✅ Define the Schema Types:** `FieldSchema`, `GridColumnSchema`, `FormSchema`, `GridSchema` in `types.ts`. Zod validators in `validators.ts`.
3. **✅ Build Renderers:** `SchemaForm` (supports text, email, number, select, textarea, checkbox, date, password) and `SchemaGrid` with `@tanstack/react-table` sorting.
4. **✅ Wire up the Showcase:** Routes use `useQuery` to fetch schemas from TanStack server functions. Zustand store manages grid row selection.
5. **✅ Iterate:** Validation via TanStack Form field-level validators, grid sorting via TanStack Table, selection state via Zustand.

### Implemented Field Types

| Type | Renderer | Status |
| :--- | :--- | :--- |
| `text` | `<Input>` | ✅ |
| `email` | `<Input type="email">` | ✅ |
| `number` | `<Input type="number">` | ✅ |
| `password` | `<Input type="password">` | ✅ |
| `select` | `<Select>` + `SelectTrigger/Content/Item` | ✅ |
| `textarea` | `<Textarea>` | ✅ |
| `checkbox` | `<Checkbox>` | ✅ |
| `date` | `<Input type="date">` | ✅ |
| `file` | `<FileUpload>` (dropzone primitive) | ✅ Phase 2 |
| `address` | `<AddressInput>` (multi-line address) | ✅ Phase 3 |

### Grid Column Types

| Type | Renderer | Status |
| :--- | :--- | :--- |
| `string` | Plain text cell | ✅ Phase 1 |
| `number` | Numeric cell | ✅ Phase 1 |
| `boolean` | Checkmark / dash | ✅ Phase 1 |
| `date` | Date string cell | ✅ Phase 2 |
| `status` | `<StatusBadge>` with configurable variants | ✅ Phase 2 |

## 8. Phase 2 Status: COMPLETE ✅

All Phase 2 objectives have been implemented:

### Sub-Phase 2A: Advanced Grid Features ✅
- **Pagination:** `GridPagination` component with configurable page sizes, page navigation, and total count display.
- **Filtering:** Global toolbar search filter via `GridToolbar`. Column-level filters via TanStack Table `getFilteredRowModel`.
- **Column Resizing:** Interactive column width dragging via TanStack Table `getFilteredRowModel` with CSS resize handles.
- **Column Visibility:** Dropdown menu to toggle column visibility on/off.
- **Style Props:** `striped`, `bordered`, `hoverable` consumed by `SchemaGrid` for visual variants.
- **Empty State:** `emptyMessage` displayed when data array is empty.

### Sub-Phase 2B: Bespoke Layer 1 Primitives ✅
- **`DataTable`:** A generic table wrapper with sorting indicators, header click handlers, and column resize support.
- **`StatusBadge`:** Renders status values as colored badges with configurable variant mappings.
- **`AddressInput`:** A multi-line address input primitive (structured address fields).
- **`FileUpload`:** A drag-and-drop file upload zone with accept/maxSize/multiple constraints.
- **Status column rendering:** `SchemaGrid` auto-renders `type: 'status'` columns using `StatusBadge`.

### Sub-Phase 2C: Schema-Driven Layout Rules ✅
- **`FieldCondition` interface:** Supports `equals`, `notEquals`, `in` operators for conditional logic.
- **`visibleWhen` on `FieldSchema`:** Fields can be conditionally shown/hidden based on other field values.
- **`dependsOn` on `FieldSchema`:** Declares field dependencies for the engine.
- **`colSpan` on `FieldSchema`:** Fields can span multiple grid columns in `layout: 'grid'` forms.
- **`evaluateCondition` function:** Evaluates `FieldCondition` against current form values.
- **Conditional rendering in `SchemaForm`:** Uses `form.Subscribe` to reactively show/hide fields.

### Sub-Phase 2D: File Upload Field Type ✅
- **`FileUploadConfig` interface:** `accept`, `maxSize`, `multiple` properties on `FieldSchema.fileConfig`.
- **`FileUpload` primitive:** Drag-and-drop zone with file list display and remove functionality.
- **Field renderer `case 'file'`:** Renders `FileUpload` with schema-driven constraints.

### Sub-Phase 2E: Showcase Polish ✅
- **New routes:** `demo-orders` (orders grid with status badges), `demo-registration` (conditional fields + file upload), `demo-support-ticket` (conditional priority fields + multi-file upload).
- **New shadcn components:** `badge`, `dropdown-menu`, `dialog`, `textarea`, `checkbox` added to showcase.
- **Updated navigation:** All new routes linked in `__root.tsx` nav bar.
- **Mock data:** Order grid schema/data, registration form schema, support ticket form schema with conditional visibility rules.

## 9. Phase 3 Status: COMPLETE ✅

### Phase 3A: Architectural Fixes ✅
- **FileUpload via PrimitivesContext:** Removed direct import from field-renderer; now injected like all other primitives.
- **Dead code removal:** Deleted unused `DataTable` primitive that violated Layer 1 by importing `@tanstack/react-table`.
- **Global search in GridToolbar:** Added search input with debounced filtering across all columns.
- **onCancel moved to SchemaFormProps:** `FormSchema` is now fully JSON-serializable; callbacks live on component props.
- **Bordered grid style:** `bordered` prop on `GridSchema` now applies border utility classes to table cells.
- **Utility type exports:** `ValidationRule`, `FieldCondition`, `SelectOption`, `FileUploadConfig`, etc. exported from engine index.
- **AddressInput wired to engine:** New `address` field type renders via `AddressInput` from `PrimitivesContext`.

### Phase 3B: Production Features ✅
- **Accessibility (ARIA):** `FieldRenderer` adds `aria-required`, `aria-invalid`, `aria-describedby` to all field types; error messages use `role="alert"`.
- **Theme provider:** `ThemeProvider` context accepts `ThemeConfig` with optional CSS class overrides for grid, form, and pagination elements.
- **Internationalization:** `I18nConfig` on `FormSchema`/`GridSchema` with `useI18n()` hook and `t()` translation function.
- **Server-side pagination:** `ServerPaginationConfig` on `GridSchema`, `onPageChange` callback on `SchemaGridProps`, toolbar displays server page info.
- **CI/CD pipelines:** GitHub Actions workflows for CI (typecheck + build + lint on push/PR) and npm publish (on release).

### Phase 4 Considerations (Not Yet Implemented)

- [ ] Virtualized scrolling for large datasets
- [ ] Date picker primitive (calendar-based, not native input)
- [ ] Multi-select / tag input field type
- [ ] Form wizard / multi-step layout
- [ ] Column reordering via drag-and-drop

---

## Appendix A: AI-README Template

When creating a new folder, use this exact structure. No fluff. No friendly intros. Just constraints and mappings.

```markdown
# [FOLDER_NAME]

## Purpose

[1 sentence: What is this folder responsible for in the 3-Layer Architecture?]

## Dependencies (Imports FROM)

[List exactly which layers/folders this folder is allowed to import from]

## Dependents (Imported BY)

[List which layers/folders are allowed to import this]

## Constraints

- [Rule 1]
- [Rule 2]

## 🚫 FORBIDDEN

- [Action 1 that must NEVER happen here]
- [Action 2 that must NEVER happen here]
```

## Appendix B: Package Configuration

### `packages/core/package.json`

```json
{
  "name": "@my-framework/core",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./primitives": "./dist/primitives/index.js",
    "./engine": "./dist/engine/index.js"
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts"
  }
}
```

> NOTE: We use `tsup` instead of `tsc` because it handles bundling TypeScript declarations and ESM natively with zero config, which is vital for monorepos.

### `packages/core/tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

> WARNING: There is NO path aliasing here. Strict relative imports only.

## Appendix C: State Management Interfaces

When building the Zustand stores for the Showcase app, they must follow this generic pattern to remain decoupled from specific business logic:

```typescript
// Generic Selection Store — instantiated per feature via createSelectionStore()
interface SelectionStore<T = unknown> {
  selectedId: string | null
  selectedData: T | null
  setSelected: (id: string, data: T) => void
  clearSelection: () => void
}
```

Do not create stores like `useShipmentStore`. Use `createSelectionStore` and instantiate it per feature if necessary, or keep it global to the page layout.

## Appendix D: Server Functions & Serialization

TanStack Start server functions (`createServerFn`) return values over the network. All schema types and data returned from server functions **must be serializable** (no functions, no `unknown`, no `ReactNode`).

- `GridColumnSchema` intentionally does **not** have a `render` property. Custom cell rendering is a client-side concern handled by the `SchemaGrid` renderer based on column `type`.
- `FieldSchema.defaultValue` is typed as `string | number | boolean | null` (not `unknown`) to ensure JSON serialization works.