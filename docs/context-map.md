# Project Context Map

> **Note:** Per-directory context is now stored in `.context.json` files alongside source code.
> See `docs/ai/system.md` for the compressed AI entry point.

## Cross-Layer Dependency Graph

```mermaid
graph TD
    subgraph "Layer 1: Primitives"
        primitives["primitives/<br/>(StatusBadge, AddressInput, FileUpload, DatePicker, TagInput)"]
    end

    subgraph "Layer 2: Engine"
        types["types/<br/>(schema type definitions)"]
        validators["validators/<br/>(Zod schemas)"]
        context["context/<br/>(PrimitivesContext)"]
        helpers["helpers/<br/>(i18n, deepFreeze)"]
        renderers["renderers/<br/>(SchemaForm, SchemaGrid, SchemaWizard, FieldRenderer)"]
    end

    subgraph "Layer 3: Composition"
        routes["routes/<br/>(TanStack Start routes)"]
        server["server/<br/>(createServerFn)"]
        data["data/<br/>(mock schemas + data)"]
    end

    validators -->|uses-type| types
    context -->|uses-type| types
    helpers -->|uses-type| types
    renderers -->|uses-type| types
    renderers -->|validates| validators
    renderers -->|provides primitives| context
    renderers -->|consumes| helpers
    renderers -->|imports| primitives
    routes -->|imports| renderers
    server -->|imports| data
    routes -->|fetches via useQuery| server
    ```

## Tier 2 Lookup Files

For quick symbol and dependency lookups, see the auto-generated and hand-crafted files in `docs/ai/`:

| File | Purpose | Source |
|------|---------|--------|
| `docs/ai/symbol-index-manifest.json` | Symbol count per layer | Auto-generated |
| `docs/ai/symbol-index-layer{1,2,3}.json` | Export→file lookup per layer | Auto-generated |
| `docs/ai/impact-graph.json` | Reverse dependency graph | Auto-generated |
| `docs/ai/directory-index.json` | Directory→purpose mapping | Auto-generated |
| `docs/ai/flows.json` | Data flow descriptions | Hand-crafted |
| `docs/ai/config-schema.json` | Configuration schema reference | Hand-crafted |
| `docs/ai/error-taxonomy.json` | Error catalog with fixes | Hand-crafted |

## Key Barrel Files

| File | Role |
|------|------|
| `packages/core/src/index.ts` | Public API — re-exports from primitives/ and engine/ |
| `packages/core/src/engine/index.ts` | Engine barrel — re-exports all subdirectories |
| `packages/core/src/engine/types/index.ts` | Types barrel — re-exports all type definition files |
| `packages/core/src/engine/validators/index.ts` | Validators barrel — re-exports all validator files |

## Data Flow

```mermaid
graph LR
    data["data/"] -->|schema JSON| server["server/"]
    server -->|useQuery| routes["routes/"]
    routes -->|SchemaForm/SchemaGrid/SchemaWizard| renderers["@my-framework/core"]
