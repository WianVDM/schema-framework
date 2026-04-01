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

## Tech Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Framework:** TanStack Start (file-based routing)
- **UI Components:** shadcn/ui (adapter pattern — core never hardcodes shadcn imports)
- **Validation:** Zod
- **State:** TanStack Query, TanStack Form, Zustand
- **Build:** tsup (for the core package)

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

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Full architectural blueprint, constraints, and conventions.