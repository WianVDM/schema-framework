# Schema Framework

A data-driven UI framework inspired by Ext.NET, built on **TanStack Start**, **shadcn/ui**, and a strict **3-Layer Architecture**.

## The Idea

Instead of hardcoding UI components in React, the backend owns **metadata** — JSON schemas that define grids, forms, and field layouts. The frontend **renders** whatever schema it receives. This means screens can be customized per customer, permission, or workflow **without deploying new frontend code**.

## Architecture

The framework is organized as a pnpm monorepo with three strict dependency layers:

| Layer | Location | Responsibility |
|---|---|---|
| **Primitives** (Layer 1) | `packages/core/src/primitives/` | Generic UI wrappers built on shadcn/ui. No schema awareness. |
| **Engine** (Layer 2) | `packages/core/src/engine/` | Schema types, Zod validators, and renderers (`SchemaForm`, `SchemaGrid`). |
| **Composition** (Layer 3) | `apps/showcase/` | TanStack Start routes that fetch schemas and pass them to the Engine. |

Dependency flow is **one-way only**: Layer 3 → Layer 2 → Layer 1. A lower layer must never import from a higher layer.

## Features

### Schema-Driven Forms (`SchemaForm`)

| Field Type | Renderer | Status |
|---|---|---|
| `text` | `<Input>` | ✅ |
| `email` | `<Input type="email">` | ✅ |
| `number` | `<Input type="number">` | ✅ |
| `password` | `<Input type="password">` | ✅ |
| `select` | `<Select>` + trigger/content/items | ✅ |
| `textarea` | `<Textarea>` | ✅ |
| `checkbox` | `<Checkbox>` | ✅ |
| `date` | `<Input type="date">` | ✅ |
| `file` | `<FileUpload>` (drag-and-drop zone) | ✅ |
| `address` | `<AddressInput>` (multi-line address) | ✅ |

### Schema-Driven Grids (`SchemaGrid`)

| Column Type | Renderer | Status |
|---|---|---|
| `string` | Plain text cell | ✅ |
| `number` | Numeric cell | ✅ |
| `boolean` | Checkmark / dash | ✅ |
| `date` | Date string cell | ✅ |
| `status` | `<StatusBadge>` with configurable variants | ✅ |

Grid features: pagination, column resizing, column visibility toggle, global filtering, striped/bordered/hoverable style variants, server-side pagination support.

### Capabilities

- **Conditional Visibility** — Fields show/hide based on other field values (`visibleWhen`, `dependsOn`, `evaluateCondition`)
- **Internationalization** — `I18nConfig` with `useI18n()` hook and `t()` translation function
- **Theming** — `ThemeProvider` with `ThemeConfig` for CSS class overrides on grid, form, and pagination elements
- **Accessibility** — ARIA attributes on all fields (`aria-required`, `aria-invalid`, `aria-describedby`), error messages with `role="alert"`
- **Immutability** — Branded types (`FieldId`, `DataKey`), `ReadonlyDeep<T>`, `deepFreeze<T>()` for compile-time and runtime immutability

## Design Patterns

### Shadcn Adapter Pattern

Because shadcn/ui is copy-pasted code (not an npm package), `packages/core` never hardcodes shadcn import paths. Instead, a `PrimitivesContext` in Layer 2 accepts all required UI components. The Showcase app (Layer 3) wraps the app in a provider that maps shadcn/ui components to the `PrimitiveComponents` interface. This makes the framework agnostic to the end-user's specific shadcn theme or file structure.

### Immutability Strategy

All schema types enforce immutability at two levels: **compile-time** via `readonly` properties and `ReadonlyDeep<T>` on arrays/nested objects, and **runtime** via `deepFreeze<T>()`. Branded types (`FieldId`, `DataKey`) prevent accidental string interchange. String literal unions (`ConditionOperator`, `ValidationType`) replace bare `string` in validators.

## Tech Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Framework:** TanStack Start (file-based routing)
- **UI Components:** shadcn/ui (adapter pattern — core never hardcodes shadcn imports)
- **Tables:** @tanstack/react-table (sorting, filtering, pagination, column sizing)
- **Forms:** @tanstack/react-form (field-level validation, dirty-state tracking)
- **Data Fetching:** TanStack Query (`useQuery`)
- **Validation:** Zod (schema validators)
- **State:** Zustand (selection state)
- **Versioning:** @changesets/cli (monorepo version management)
- **Build:** tsup (for the core package)
- **CI/CD:** GitHub Actions (build + typecheck on PRs, release via Changesets)

## Version & Roadmap

**Current version:** `0.1.0` (Tooling & Workflow Foundation — complete)

The project follows Semantic Versioning with a 9-milestone roadmap from `0.1.0` to `1.0.0`. During the `0.x.x` phase, the API is considered unstable. Only one milestone is active at a time.

| Milestone | Theme | Status |
|---|---|---|
| `0.1.0` | Tooling & Workflow Foundation | ✅ Complete |
| `0.2.0` | Enhanced Grid & Form Features | 🔜 Next |
| `0.3.0` | Layout System | Planned |
| `0.4.0` | Advanced Data Components | Planned |
| `0.5.0` | Complete Primitive Library | Planned |
| `0.6.0` | Documentation & Showcase Site | Planned |
| `0.7.0` | Testing Suite | Planned |
| `0.8.0` | API Polish & TSDoc | Planned |
| `0.9.0` | Release Candidate | Planned |
| `1.0.0` | Stable Release | Planned |

See the full roadmap with exit criteria and branching conventions in [`docs/roadmap.md`](docs/roadmap.md). Current milestone status is tracked in [`docs/VERSION_STATUS.md`](docs/VERSION_STATUS.md).

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build all packages
pnpm build
```

## Documentation

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — Full architectural blueprint, layer constraints, state management, and conventions
- [`docs/implementation-status.md`](docs/implementation-status.md) — Phase-by-phase feature implementation progress
- [`docs/roadmap.md`](docs/roadmap.md) — Version roadmap from `0.1.0` to `1.0.0` with exit criteria
- [`docs/VERSION_STATUS.md`](docs/VERSION_STATUS.md) — Current milestone status and checklist
- [`docs/decisions/`](docs/decisions/) — Architectural Decision Records (ADRs)
- [`docs/context-map.md`](docs/context-map.md) — Project-wide relationship graph