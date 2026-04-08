# Version Status

## Current Version: 0.1.0
## Target Version: 0.2.0
## Active Milestone: Enhanced Grid & Form Features
## Milestone Status: IN PROGRESS

## Milestone Checklist (v0.2.0) — IN PROGRESS

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
- [ ] Add `WizardSchema`, `WizardStep` types + Zod validators
- [ ] Create `SchemaWizard` renderer
- [ ] Step navigation UI (next/prev, step indicator)
- [ ] Per-step validation with TanStack Form
- [ ] Linear + non-linear step flow support
- [ ] Create showcase demo route
- [ ] `pnpm build` passes

### Slice 5: Column Reordering (`v0.2.5-feature/column-reordering`)
- [ ] Add `columnReorder` to `GridSchema`
- [ ] Integrate `@dnd-kit/core` + `@dnd-kit/sortable`
- [ ] Update `GridColumnHeader` with drag handles
- [ ] Create showcase demo
- [ ] `pnpm build` passes

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

## Upcoming Milestones
- 0.2.0 — Enhanced Grid & Form Features
- 0.3.0 — Layout System
- 0.4.0 — Advanced Data Components
- 0.5.0 — Complete Primitive Library
- 0.6.0 — Documentation & Showcase Site
- 0.7.0 — Testing Suite
- 0.8.0 — API Polish & TSDoc
- 0.9.0 — Release Candidate
- 1.0.0 — Stable Release