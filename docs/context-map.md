# Project Context Map

## Layer 1: Primitives (`packages/core/src/primitives/`)

| Directory | Purpose | Dependencies |
|-----------|---------|--------------|
| primitives/ | Generic UI wrappers (StatusBadge, AddressInput, FileUpload) | React only |

## Layer 2: Engine (`packages/core/src/engine/`)

| Directory | Purpose | Imports From | Imported By |
|-----------|---------|--------------|-------------|
| types/ | Schema type definitions (26 types, one per file) | (none — pure TS types) | validators/, context/, helpers/, renderers/ |
| validators/ | Zod schemas + runtime validation (7 files) | types/, zod | renderers/, index.ts |
| context/ | PrimitivesContext provider | types/ | renderers/ |
| helpers/ | i18n resolveMessage, deepFreeze immutability | types/ | renderers/ |
| renderers/ | SchemaForm, SchemaGrid, FieldRenderer, ThemeProvider | types/, validators/, context/, helpers/ | index.ts |

### Cross-Layer Dependency Graph

```mermaid
graph TD
    types["types/<br/>(26 type files)"]
    validators["validators/<br/>(7 Zod schemas)"]
    context["context/<br/>(PrimitivesContext)"]
    helpers["helpers/<br/>(i18n, deepFreeze)"]
    renderers["renderers/<br/>(SchemaForm, SchemaGrid, FieldRenderer)"]

    validators -->|uses-type| types
    context -->|uses-type| types
    helpers -->|uses-type| types
    renderers -->|uses-type| types
    renderers -->|validates| validators
    renderers -->|provides primitives| context
    renderers -->|consumes| helpers
```

## Layer 3: Composition (`apps/showcase/`)

| Directory | Purpose | Imports From |
|-----------|---------|--------------|
| routes/ | TanStack Start file-based routes | @my-framework/core, server/, stores/ |
| server/ | Mock server functions (createServerFn) | data/ |
| data/ | Immutable schemas, typed mock data (UserRow, OrderRow), primitive mappings | @my-framework/core |
| stores/ | Zustand selection stores | (none) |
| app/components/ | shadcn/ui components | (shadcn) |
| app/primitives-provider.tsx | Wires shadcn → PrimitivesContext | @my-framework/core |

### Data Flow

```mermaid
graph TD
    data["data/<br/>(Mock schemas + data)"]
    server["server/<br/>(createServerFn)"]
    routes["routes/<br/>(TanStack Start routes)"]
    renderers["@my-framework/core<br/>(Engine renderers)"]
    stores["stores/<br/>(Zustand selection)"]
    provider["primitives-provider.tsx"]
    context["PrimitivesContext"]

    data -->|schema JSON| server
    server -->|fetched via useQuery| routes
    routes -->|schema + data| renderers
    routes <-->|selection state| stores
    routes -->|wires shadcn| provider
    provider -->|injects into| context
    context -->|usePrimitives| renderers
```

### Layer 3 Showcase Data Flow

```mermaid
graph LR
    subgraph "Data Layer"
        MockData["mock-schemas.ts"]
    end
    subgraph "Server Layer"
        ServerFn["schemas.ts / data.ts"]
    end
    subgraph "UI Layer"
        DemoRoutes["demo-*.tsx routes"]
    end
    subgraph "Core Library"
        Engine["@my-framework/core"]
    end

    MockData -->|static schemas| ServerFn
    ServerFn -->|useQuery| DemoRoutes
    DemoRoutes -->|SchemaForm / SchemaGrid| Engine
```

## Key Files

| File | Role |
|------|------|
| `packages/core/src/index.ts` | Public API — re-exports from primitives/ and engine/ |
| `packages/core/src/engine/index.ts` | Engine barrel — re-exports types, validators, context, helpers, renderers |
| `packages/core/src/engine/types/index.ts` | Types barrel — re-exports all 26 type files |
| `packages/core/src/engine/validators/index.ts` | Validators barrel — re-exports all 7 validator files |
| `packages/core/src/engine/helpers/deep-freeze.ts` | Runtime immutability — recursively freezes objects |
| `packages/core/src/engine/types/branded.ts` | Branded types for FieldId, DataKey |
| `packages/core/src/engine/types/readonly-deep.ts` | Recursive ReadonlyDeep<T> wrapper |
