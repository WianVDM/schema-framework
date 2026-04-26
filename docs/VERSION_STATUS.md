# Version Status

## Current Version: 0.3.4
## Target Version: 0.4.0
## Versioning Strategy: Option C — version `packages/core` only; showcase = `0.0.0-dev`
## Active Milestone: Advanced Data Components
## Milestone Status: IN PROGRESS 🚧

## Milestone Checklist (v0.4.x) — IN PROGRESS 🚧

### Slice 0: Housekeeping & Architecture (v0.4.0) — COMPLETE ✅
- [x] Create ADR-008 (`docs/decisions/008-data-components-architecture.md`)
- [x] Update `docs/VERSION_STATUS.md` for v0.4.0 target
- [x] Update `docs/roadmap.md` with v0.3 retrospective + v0.4 refinements
- [x] Verify `pnpm build` passes on current main

### Slice 1: SchemaTree Core — Types, Validators, Basic Renderer (v0.4.1) — COMPLETE ✅
- [x] Create tree types (`TreeSchema`, `TreeNode`, `TreeSelectionConfig`, `TreeIcons`, `ContextMenuConfig`)
- [x] Create tree validators (Zod)
- [x] Add `tree`, `chart`, `treeGrid` variants to `ContentSchema` + type guards
- [x] Create basic `SchemaTree` renderer (expand/collapse, indentation, node rendering)
- [x] Update `ContentRenderer` dispatcher with `tree` case
- [x] Add ContextMenu slots to `PrimitiveComponents`
- [x] Install shadcn ContextMenu in showcase
- [x] Create mock tree data + schema + demo route (`/demo-tree`)
- [x] Regenerate context maps
- [x] `pnpm build` + `pnpm typecheck` pass

### Slice 2: SchemaTree Advanced — Selection, Lazy Loading, DnD, Context Menu (v0.4.2) — PARTIAL ⚡
- [x] Implement checkbox selection (single, multi, checkbox modes via `SchemaTreeProps`)
- [x] Implement lazy loading (`onLoadChildren` + loading indicator in renderer)
- [ ] Implement drag-and-drop node reordering (`@dnd-kit/core`)
- [x] Implement context menu (right-click handler via `onContextAction` callback)
- [x] Update tree demo route with all advanced features
- [x] `pnpm build` + `pnpm typecheck` pass

### Slice 3: SchemaChart — Types, Validators, All Chart Types (v0.4.3) — PARTIAL ⚡
- [x] Add `recharts` as peerDependency in `packages/core/package.json`
- [x] Install `recharts` in showcase
- [x] Create chart types (`ChartSchema`, `ChartSeries`)
- [x] Create chart validator (Zod)
- [x] Create chart renderer (placeholder — `SchemaChart` with Recharts interface)
- [ ] Implement theme integration (CSS variables → chart colors)
- [x] Update `ContentRenderer` dispatcher with `chart` case
- [x] Create mock chart data + schema + demo route (`/demo-chart`)
- [x] Regenerate context maps
- [x] `pnpm build` + `pnpm typecheck` pass

### Slice 4: SchemaTreeGrid — Types, Validators, Hybrid Renderer (v0.4.4) — PARTIAL ⚡
- [x] Create treegrid types (`TreeGridSchema`, `TreeGridRow`)
- [x] Create treegrid validator (Zod)
- [ ] Extract shared grid helpers from SchemaGrid (cell rendering, pagination)
- [x] Create `SchemaTreeGrid` renderer (shared column model + tree expansion)
- [x] Implement lazy loading for child rows (`onLoadChildren` prop)
- [ ] Implement virtual scrolling with tree-expanded state
- [x] Update `ContentRenderer` dispatcher with `treeGrid` case
- [x] Create mock treegrid data + schema + demo route (`/demo-tree-grid`)
- [x] Regenerate context maps
- [x] `pnpm build` + `pnpm typecheck` pass

### Slice 5: Real-time Patterns — Polling & Refresh Hooks (v0.4.5) — PARTIAL ⚡
- [x] Create real-time types (`RealtimeConfig`)
- [x] Create real-time validator (Zod)
- [ ] Add `realtime?: RealtimeConfig` to `GridSchema` and `TreeSchema`
- [x] Create `useRealtime` hook (polling, stale detection, pause-on-hidden)
- [ ] Integrate into `SchemaGrid` and `SchemaTree`
- [ ] Add `onDataStale` / `onDataRefresh` callbacks
- [ ] Create demo route (`/demo-realtime-grid`)
- [ ] Regenerate context maps
- [x] `pnpm build` + `pnpm typecheck` pass

---

## Milestone Checklist (v0.3.x) — COMPLETE ✅

### Slice 0: Housekeeping & Fixes (v0.3.0) — COMPLETE ✅
- [x] Consume pending changesets via `pnpm changeset version`
- [x] Mark v0.2.0 exit criteria in `docs/roadmap.md` as complete
- [x] Create ADR-007 (`docs/decisions/007-layout-architecture.md`)
- [x] Update `docs/VERSION_STATUS.md` with enhanced slice structure
- [x] Investigate `changesets/action` workflow for changelog generation
- [x] `pnpm build` passes

### Slice 1: Layout Types, Validators & Primitives (v0.3.1) — COMPLETE ✅
- [x] Create `LayoutType` union type
- [x] Create `ResponsiveConfig` interface
- [x] Create `LayoutRegion` interface
- [x] Create `ContentSchema` discriminated union
- [x] Create `LayoutSchema` interface
- [x] Create `TabItem` interface
- [x] Create `TabSchema` interface
- [x] Create `DashboardSchema` interface
- [x] Create `LayoutRendererProps`, `DashboardRendererProps`, `TabsRendererProps`
- [x] Create Zod validators for all new types
- [x] Create `Panel` primitive in Layer 1
- [x] Create `Splitter` primitive in Layer 1
- [x] Install shadcn components (tabs, accordion, card, separator, collapsible, scroll-area, resizable)
- [x] Create `LayoutPrimitiveComponents` interface (separate from `PrimitiveComponents`)
- [x] Create `LayoutPrimitivesContext` + `CustomComponentContext`
- [x] Create helpers (`applyResponsiveClasses`, content type guards)
- [x] Update `primitive-mappings.tsx` with layout primitives
- [x] Update `primitives-provider.tsx` with new context providers
- [x] `pnpm build` passes

### Slice 2: Border Layout & SchemaPanel (v0.3.2) — COMPLETE ✅
- [x] Create `ContentRenderer` renderer
- [x] Create `SchemaPanel` renderer
- [x] Create `SchemaLayout` renderer (border layout)
- [x] Create `BorderPosition` type + `validateBorderLayout` validator
- [x] Create mock data for border layout
- [x] Create showcase demo route (`/demo-border-layout`)
- [x] Versioning strategy correction (Option C: version core only, showcase = `0.0.0-dev`)
- [x] `pnpm build` passes
- [x] Implement runtime responsive collapse (`useResponsiveCollapse` hook wired into `SchemaLayout`)

> **NOTE:** All layout renderer tests (ContentRenderer dispatch, SchemaPanel, SchemaLayout, BorderLayoutValidator, E2E for `/demo-border-layout`) are deferred to v0.7.0 (Testing Suite milestone).

### Slice 3: Accordion, Card, HBox, VBox, Tabs Layouts (v0.3.3) — COMPLETE ✅
- [x] Create `AccordionConfig`, `CardGridConfig`, `BoxConfig` type interfaces
- [x] Update `LayoutSchema` with type-specific config fields
- [x] Update `TabSchema` with `mountMode` field for lazy mounting
- [x] Add `TabsList`, `TabsTrigger`, `TabsContent` to `LayoutPrimitiveComponents`
- [x] Create type-specific validators (`accordion-layout`, `card-layout`, `box-layout`)
- [x] Create `AccordionLayoutRenderer` with animation config support
- [x] Create `CardLayoutRenderer` with CSS Grid responsive breakpoints
- [x] Create `HBoxLayoutRenderer` + `VBoxLayoutRenderer` with flex config
- [x] Create `SchemaTabs` renderer with lazy mounting hook (`useLazyTabContent`)
- [x] Wire all renderers in `SchemaLayout` — no more `NotImplementedPlaceholder`
- [x] Replace `TabsPlaceholder` in `ContentRenderer` with `SchemaTabs`
- [x] Create mock data for each layout type
- [x] Create showcase demo routes for each layout type
- [x] Update `primitives-provider` with Tabs sub-component mapping
- [x] Regenerate context maps
- [x] `pnpm build` passes

### Slice 4: SchemaDashboard, Stack Layout & Responsive Cleanup (v0.3.4) — COMPLETE ✅
- [x] Add `StackConfig` type + `"stack"` to `LayoutType` union
- [x] Add `stackConfig` to `LayoutSchema`, `stackBelow` to `BoxConfig`
- [x] Redesign `DashboardSchema` for multi-panel composition
- [x] Create `StackLayoutRenderer` with prev/next navigation and keyboard support
- [x] Create `SchemaDashboard` renderer with tabbed panel navigation
- [x] Add `stackBelow` responsive stacking to HBox/VBox layouts
- [x] Create Zod validators for stack layout and updated dashboard schema
- [x] Create mock data for dashboard and stack layout
- [x] Create showcase demo routes (`/demo-dashboard`, `/demo-stack-layout`)
- [x] Wire all new renderers in `SchemaLayout` dispatcher
- [x] `pnpm build` + `pnpm typecheck` pass

## Milestone Checklist (v0.2.0) — COMPLETE ✅

### Slice 1: Virtualized Scrolling (`v0.2.1-feature/virtual-scroll`)
- [x] Add `VirtualScrollConfig` type + Zod validator
- [x] Add `virtualScroll` option to `GridSchema`
- [x] Integrate `@tanstack/react-virtual` into `SchemaGrid`
- [x] Create showcase demo with 10k mock rows
- [x] `pnpm build` passes

### Slice 2: DatePicker Primitive (`v0.2.2-feature/date-picker`)
- [x] Add `DatePickerConfig` type + Zod validator
- [x] Create `DatePicker` primitive in Layer 1 (self-contained with date-fns + react-day-picker)
- [x] Add to `PrimitiveComponents` + `PrimitivesContext` defaults
- [x] Update `field-renderer.tsx` for `'date'` type
- [x] Wire DatePicker in showcase primitive-mappings
- [x] Create showcase demo route (`/demo-date-picker`)
- [x] Fix Slice 1 gaps (extract useTheme, AddressData, AddressPlaceholders; convert .context.md to Mermaid)
- [x] `pnpm build` passes

### Slice 3: Multi-Select / TagInput (`v0.2.3-feature/multi-select`)
- [x] Add `'multiselect'` to `FieldType` union
- [x] Add `MultiSelectConfig` type + Zod validator
- [x] Create `TagInput` primitive in Layer 1
- [x] Add to `PrimitiveComponents` + `PrimitivesContext` defaults
- [x] Update `field-renderer.tsx` for `'multiselect'`
- [x] Wire in showcase + create demo route
- [x] `pnpm build` passes

### Slice 4: Form Wizard (`v0.2.4-feature/form-wizard`)
- [x] Add `WizardSchema`, `WizardStep` types + Zod validators
- [x] Create `SchemaWizard` renderer
- [x] Step navigation UI (next/prev, step indicator)
- [x] Per-step validation with TanStack Form
- [x] Linear + non-linear step flow support
- [x] Create showcase demo route
- [x] Fix Slice 3 gaps (`.strict()` on datePickerConfig, `ComponentType` fix in field-renderer)
- [x] `pnpm build` passes

### Slice 5: Column Reordering & Code Quality (`v0.2.5-feature/column-reordering`)
- [x] Add `columnReorder` to `GridSchema`
- [x] Integrate `@dnd-kit/core` + `@dnd-kit/sortable`
- [x] Update `GridColumnHeader` with drag handles
- [x] Create showcase demo (`/demo-column-reordering`)
- [x] Extract shared `isFieldVisible` helper (DRY from wizard + review step)
- [x] Replace `() => null` with named `DefaultFallbackComponent` in field-renderer
- [x] Add `onStepChange` callback to `SchemaWizard`
- [x] Add `onColumnOrderChange` callback to `SchemaGrid`
- [x] Enhance wizard demo with non-linear mode toggle + initialValues
- [x] `pnpm build` passes

## Milestone Checklist (v0.1.0) — COMPLETE ✅
- [x] Install and configure `@changesets/cli`
- [x] Add changeset workflow scripts to root `package.json`
- [x] Create `docs/roadmap.md`
- [x] Create `docs/VERSION_STATUS.md`
- [x] Populate `.clinerules/workspace-versioning.md`
- [x] Update `.clinerules/workspace-workflows.md` with Workflow G & H
- [x] Update `.clinerules/hooks/PreToolUse.ps1` with branch + changeset checks
- [x] Create `.github/pull_request_template.md`
- [x] Create `.github/workflows/release.yml`
- [x] Add ADR-003 for SemVer/Changesets decision
- [x] Fix file structure violations (multi-export files in showcase)
- [x] Bump `packages/core` to `0.1.0`
- [x] Bump `apps/showcase` to `0.1.0`
- [x] Update `ARCHITECTURE.md` with Section 9
- [x] Verify `pnpm build` passes

## Completed Milestones
- **0.1.0 — Tooling & Workflow Foundation** (completed 2026-04-05)
- **0.2.0 — Enhanced Grid & Form Features** (completed 2026-04-09)
- **0.3.0 — Layout System** (completed 2026-04-26)

## Upcoming Milestones
- 0.4.0 — Advanced Data Components
- 0.5.0 — Complete Primitive Library
- 0.6.0 — Documentation & Showcase Site
- 0.7.0 — Testing Suite
- 0.8.0 — API Polish & TSDoc
- 0.9.0 — Release Candidate
- 1.0.0 — Stable Release