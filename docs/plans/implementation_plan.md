# Implementation Plan

[Overview]
Scaffold the complete monorepo for a data-driven UI framework built on TanStack Start, shadcn/ui, and a strict 3-Layer Architecture (Primitives → Engine → Composition), using pnpm workspaces and Turborepo.

This plan executes **Workflow A: Initial Project Setup** exactly as defined in `.clinerules/workspace-rules.md`. The project is currently a greenfield workspace containing only `docs/ARCHITECTURE.md` and an empty `docs/plans/` directory. We must install pnpm (not present on the system), configure the monorepo root, create the `packages/core` library (Layers 1 & 2) with its mandatory `tsup` build and strict-relative-import policy, scaffold the `apps/showcase` TanStack Start application (Layer 3) with file-based routing via `createFileRoute`, initialize shadcn/ui inside the showcase app, and ensure the Turborepo build pipeline works end-to-end with zero TypeScript errors. A critical checkpoint exists at Step 5 where auto-generated blank READMEs (injected by the PostToolUse hook) must be populated with correct AI-README Template content before any implementation code is written.

[Types]
No type system changes are required for this scaffolding phase. The source files in `packages/core/src/` will contain only empty barrel exports (`export {}`) as placeholders. The actual TypeScript interfaces (`FieldSchema`, `GridColumnSchema`, etc.) and Zod validators will be defined in a future Workflow (Phase 1, Step 2 of ARCHITECTURE.md Section 7).

The only type-related configuration is in `tsconfig.json` files:
- `packages/core/tsconfig.json`: strict mode, `jsx: "react-jsx"`, `moduleResolution: "bundler"`, NO path aliases.
- `apps/showcase/tsconfig.json`: strict mode, `jsx: "react-jsx"`, `moduleResolution: "bundler"`, `paths: { "@/*": ["./src/*"] }`.

[Files]

### New Files to Create

**Root Monorepo Configuration:**
- `package.json` — Root workspace package.json with turbo and typescript as devDependencies, `dev` and `build` scripts.
- `pnpm-workspace.yaml` — Defines `apps/*` and `packages/*` as workspace members.
- `turbo.json` — Task pipeline: `build` depends on `^build` with `dist/**` outputs; `dev` is persistent and uncached.

**`packages/core/` (Layer 1 & 2):**
- `packages/core/package.json` — Name `@my-framework/core`, type module, tsup build, exports map with `.`, `./primitives`, `./engine` entry points. React 19 as peerDependency.
- `packages/core/tsconfig.json` — Strict, declaration, declarationMap, sourceMap, outDir `./dist`, rootDir `./src`, NO path aliases.
- `packages/core/src/index.ts` — Public API barrel: re-exports from `./primitives` and `./engine`.
- `packages/core/src/primitives/index.ts` — Empty barrel export placeholder for Layer 1.
- `packages/core/src/engine/index.ts` — Empty barrel export placeholder for Layer 2.

**`apps/showcase/` (Layer 3):**
- `apps/showcase/package.json` — Name `showcase`, depends on `@my-framework/core: workspace:*`, `@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/react-query`, `react`, `react-dom`, `vinxi`, `zod`. DevDeps: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `typescript`.
- `apps/showcase/tsconfig.json` — Strict, bundler moduleResolution, `@/*` path alias to `./src/*`.
- `apps/showcase/vite.config.ts` — Vite config with tailwindcss, tanstackStart (srcDirectory: `src`, routesDirectory: `app`), and react plugins.
- `apps/showcase/src/router.tsx` — Creates router instance with `createRouter` and generated `routeTree`.
- `apps/showcase/src/entry-client.tsx` — Client-side hydration: `hydrateRoot` call.
- `apps/showcase/src/entry-server.tsx` — Server-side rendering entry using TanStack Start's `StartServer` and `getRouter`.
- `apps/showcase/src/styles.css` — Tailwind v4 entry: `@import "tailwindcss";`.
- `apps/showcase/src/app/__root.tsx` — Root route layout with `<html>`, `<head>` (`HeadContent`), `<body>` (`Outlet`, `Scripts`).
- `apps/showcase/src/app/index.tsx` — Home page route using `createFileRoute('/')`.
- `apps/showcase/src/lib/utils.ts` — Utility file for shadcn (`cn` function using `clsx` + `tailwind-merge`).

### Auto-Generated Files (PostToolUse Hook — Must Be Populated)

The following README.md files will be auto-generated as BLANK templates by the PostToolUse hook when directories are created. They MUST be immediately populated with correct content per the AI-README Template (ARCHITECTURE.md Appendix A):

- `apps/README.md`
- `apps/showcase/README.md`
- `packages/README.md`
- `packages/core/README.md`
- `packages/core/src/primitives/README.md`
- `packages/core/src/engine/README.md`

### Files Modified by Tools
- `apps/showcase/components.json` — Created by `npx shadcn@latest init` command.
- `apps/showcase/src/components/ui/button.tsx` — Created by `npx shadcn@latest add button` command.

[Functions]

### New Functions

- **`getRouter()`** — File: `apps/showcase/src/router.tsx`. Signature: `() => Router`. Purpose: Creates and returns a new TanStack Router instance configured with the generated route tree and scroll restoration.

- **`RootLayout()`** — File: `apps/showcase/src/app/__root.tsx`. Signature: `() => JSX.Element`. Purpose: Root layout component rendering `<html>` shell with `HeadContent`, `Outlet`, and `Scripts`.

- **`HomePage()`** — File: `apps/showcase/src/app/index.tsx`. Signature: `() => JSX.Element`. Purpose: Home page component displaying a welcome message to verify the app is running.

- **`cn(...inputs)`** — File: `apps/showcase/src/lib/utils.ts`. Signature: `(...inputs: ClassValue[]) => string`. Purpose: Utility for merging Tailwind CSS classes (required by shadcn/ui).

No functions are modified or removed (greenfield project).

[Classes]

No classes are created in this scaffolding phase. The source files contain only function components and barrel exports.

[Dependencies]

### New Packages

**Root devDependencies:**
- `turbo`: `^2` — Monorepo build orchestrator.
- `typescript`: `^5.8` — TypeScript compiler.

**`packages/core` devDependencies:**
- `tsup`: `^8` — Zero-config TypeScript bundler (ESM + DTS).
- `typescript`: `^5.8`
- `react`: `^19`
- `@types/react`: `^19`

**`packages/core` peerDependencies:**
- `react`: `^19`

**`apps/showcase` dependencies:**
- `@my-framework/core`: `workspace:*` — Symlinked local core package.
- `@tanstack/react-router`: `^1.168` — File-based routing.
- `@tanstack/react-start`: `^1.167` — Full-stack React framework (SSR, Vinxi).
- `@tanstack/react-query`: `^5.90` — Data fetching and caching.
- `react`: `^19`
- `react-dom`: `^19`
- `vinxi`: `^0.6` — Server runner for TanStack Start.
- `zod`: `^3.24` — Schema validation.

**`apps/showcase` devDependencies:**
- `@types/react`: `^19`
- `@types/react-dom`: `^19`
- `@vitejs/plugin-react`: `^4`
- `vite`: `^6`
- `typescript`: `^5.8`
- `tailwindcss`: `^4`
- `@tailwindcss/vite`: `^4`

**shadcn/ui (installed by CLI):**
- `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react` — Pulled in by `npx shadcn@latest init`.

### Prerequisites
- **pnpm** must be installed globally: `npm install -g pnpm`

[Testing]

No automated tests are written during this scaffolding phase. Validation is performed by:

1. **Build verification:** `pnpm run build` must complete with zero TypeScript errors. Turborepo builds `packages/core` first (tsup), then `apps/showcase` (vinxi build).
2. **Dev server verification:** `pnpm run dev` should start the showcase app on `http://localhost:3000` and render the home page.
3. **shadcn verification:** The `button` component should be importable and renderable in the showcase app.

Per **Workflow E** (workspace-workflows.md), the task is NOT done if there are unhandled TypeScript errors.

[Implementation Order]

1. **Install pnpm globally:** `npm install -g pnpm`
2. **Create root monorepo config:** Write `package.json`, `pnpm-workspace.yaml`, `turbo.json` at project root.
3. **Create `packages/core/` directory structure:** Create directories `packages/core/src/primitives/` and `packages/core/src/engine/` (triggers PostToolUse hook for README generation).
4. **Write `packages/core` config files:** Write `packages/core/package.json` (with tsup, exports map) and `packages/core/tsconfig.json` (strict, no aliases).
5. **Write `packages/core` source stubs:** Write `src/index.ts`, `src/primitives/index.ts`, `src/engine/index.ts` as empty barrel exports.
6. **PAUSE — Populate all auto-generated README.md files:** Fill `packages/README.md`, `packages/core/README.md`, `packages/core/src/primitives/README.md`, `packages/core/src/engine/README.md` with correct AI-README Template content (Purpose, Dependencies, Dependents, Constraints, FORBIDDEN).
7. **Create `apps/showcase/` directory structure:** Create `apps/showcase/` directory (triggers PostToolUse hook).
8. **Populate `apps/README.md` and `apps/showcase/README.md`:** Fill with AI-README Template content.
9. **Write `apps/showcase` config files:** Write `package.json`, `tsconfig.json`, `vite.config.ts`.
10. **Write TanStack Start source files:** Write `src/router.tsx`, `src/entry-client.tsx`, `src/entry-server.tsx`, `src/styles.css`, `src/lib/utils.ts`.
11. **Write route files:** Write `src/app/__root.tsx`, `src/app/index.tsx`.
12. **Run `pnpm install`** at root to install all workspace dependencies and create symlinks.
13. **Initialize shadcn/ui:** Run `npx shadcn@latest init` and `npx shadcn@latest add button` inside `apps/showcase`.
14. **Run `pnpm run build`** to verify zero TypeScript errors.
15. **Remind user** to run `pnpm dev` and visually verify the app.