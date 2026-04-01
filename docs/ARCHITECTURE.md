# Architecture Blueprint: Data-Driven UI Framework

## 1. The Core Philosophy

We are not rebuilding Ext.NET's server-side component tree (React forbids this). Instead, we are extracting what made Ext.NET incredibly valuable for logistics: **Configurability** and **Data-Driven UI**.

In this framework, the C# backend (or any backend) owns the **Metadata** (JSON Schemas defining grids and forms), while the React frontend owns the **Rendering**. This allows screens to be modified per customer, permission, or workflow without deploying frontend code.

## 2. The 3-Layer Architecture

The framework relies on a strict, one-way dependency chain. A higher layer can import a lower layer, but never vice-versa.

### Layer 1: Primitives (The Raw Materials)

- **What it is:** Generic, highly reusable components built on top of shadcn/ui (e.g., `DataTable`, `StatusBadge`, `AddressInput`).
- **Rule:** These know nothing about JSON schemas. They just accept standard React props.

### Layer 2: The Engine (The "Ext.NET" Brain)

- **What it is:** The schema system. It contains the TypeScript interfaces defining what a schema is, the Zod validators, and the `SchemaForm`/`SchemaGrid` renderers.
- **How it works:** The `FieldRenderer` acts as a switchboard, reading a schema `type: 'select'` and rendering the Layer 1 `<Select>` component.

### Layer 3: Composition (The App/Showcase)

- **What it is:** The actual page files (TanStack Start routes).
- **How it works:** This layer fetches the JSON schema from the backend, fetches the actual business data, and passes both into the Layer 2 Engine.

## 3. The Monorepo Structure

To build a reusable library, we separate the Engine/Primitives from the visual showcase, but keep them in one single Git repository (Monorepo) using pnpm and Turborepo.

```
my-schema-framework/               # <- ONE SINGLE GIT REPO
├── apps/
│   └── showcase/                  # <- LAYER 3 (The Ext.NET "Examples Dashboard")
│       ├── app/                   #     TanStack Start routes demonstrating components
│       ├── server/                #     Mock TanStack server functions returning fake schemas
│       └── package.json           #     Depends on "@my-framework/core"
│
├── packages/
│   └── core/                      # <- LAYERS 1 & 2 (The actual npm library)
│       ├── src/
│       │   ├── primitives/        #     Layer 1: Generic UI wrappers
│       │   ├── engine/            #     Layer 2: Schema types, validators, renderers
│       │   └── index.ts           #     Public API exports
│       └── package.json           #     Name: "@my-framework/core"
│
├── pnpm-workspace.yaml            # Links apps and packages together locally
├── turbo.json                     # Orchestrates builds (build core before showcase)
└── package.json
```

## 4. State Management Strategy

We replace the monolithic Ext JS "Store" with a modern, separated approach:

| Ext.NET Concept | Modern TanStack Equivalent | Purpose |
| :--- | :--- | :--- |
| **Store (Data)** | `TanStack Query` (`useQuery`) | Fetches and caches the actual business data (e.g., list of shipments). |
| **Store (Metadata)** | `TanStack Query` (`useQuery`) | Fetches the JSON Schema defining the UI layout. Treated as read-only. |
| **Store (Selection)** | **Zustand** (Global Store) | Tracks UI state (e.g., "Which row is currently clicked?"). Shared across sibling components. |
| **Store (Dirty State)** | **TanStack Form** | Tracks if the user typed in a form field, handles validation, and knows exactly what changed. |

## 5. The "Shadcn Dependency" Rule

Because shadcn/ui is copy-pasted code (not an npm package), your `packages/core` library cannot hardcode import paths to shadcn files.

**The Solution:** Your Layer 2 renderers must accept their required base HTML elements (`Table`, `Input`, `Select`) via a `primitives` prop, or via a Context Provider. This makes your framework agnostic to the end-user's specific shadcn theme or file structure.

```typescript
// Inside packages/core/src/engine/renderers/schema-grid.tsx

// DO NOT DO: import { Table } from '@/components/ui/table'

// DO THIS:
interface Primitives {
  Table: React.ComponentType<any>;
  TableRow: React.ComponentType<any>;
  TableCell: React.ComponentType<any>;
}

export function SchemaGrid({ schema, data, primitives }: Props & { primitives: Primitives }) {
  const { Table, TableRow, TableCell } = primitives;
  // render using these passed components
}
```

The Showcase app (Layer 3) will wrap `SchemaGrid`, passing its specific shadcn components into it.

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

## 7. Phase 1: Getting Started (The Action Plan)

To prevent scope creep, do exactly this, in this order:

1. **Scaffold the Monorepo:** Set up pnpm, Turborepo, and TanStack Start in `apps/showcase`. Initialize shadcn/ui in the showcase app.
2. **Define the Schema Types:** In `packages/core/src/engine/types.ts`, write the TypeScript interfaces for `FieldSchema` and `GridColumnSchema`. Write the Zod validation schemas alongside them.
3. **Build One Renderer:** Build the `SchemaForm` component in the core package. Have it only support `type: 'text'` and `type: 'number'` to start. Pass shadcn `<Input>` components to it via props from the showcase.
4. **Wire up the Showcase:** Create a route in the showcase app. Hardcode a JSON object representing a simple form. Pass it to your `SchemaForm`.
5. **Iterate:** Add a `type: 'select'`. Add validation. Once the Form feels solid, repeat the process for `SchemaGrid` using `@tanstack/react-table`.

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

### `packages/core/package.json` (Mandatory)

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

### `packages/core/tsconfig.json` (Mandatory)

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
// Generic Selection Store Shape
interface SelectionStore<T = any> {
  selectedId: string | null;
  selectedData: T | null;
  setSelected: (id: string, data: T) => void;
  clearSelection: () => void;
}
```

Do not create stores like `useShipmentStore`. Create `useSelectionStore` and instantiate it per feature if necessary, or keep it global to the page layout.