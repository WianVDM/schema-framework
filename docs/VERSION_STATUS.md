# Version Status

## Current Version: 0.1.0
## Target Version: 0.2.0
## Active Milestone: Enhanced Grid & Form Features
## Milestone Status: IN PROGRESS

## Milestone Checklist (v0.2.0) — IN PROGRESS

### Slice 1: Virtualized Scrolling (`feature/v0.2.0-virtual-scroll`)
- [x] Add `VirtualScrollConfig` type + Zod validator
- [x] Add `virtualScroll` option to `GridSchema`
- [x] Integrate `@tanstack/react-virtual` into `SchemaGrid`
- [x] Create showcase demo with 10k mock rows
- [x] `pnpm build` passes

### Slice 2: DatePicker Primitive (`feature/v0.2.0-date-picker`)
- [ ] Add `DatePickerConfig` type + Zod validator
- [ ] Create `DatePicker` primitive in Layer 1
- [ ] Add to `PrimitiveComponents` + `PrimitivesContext` defaults
- [ ] Update `field-renderer.tsx` for `'date'` type
- [ ] Wire shadcn Calendar/Popover in showcase
- [ ] Create showcase demo route
- [ ] `pnpm build` passes

### Slice 3: Multi-Select / TagInput (`feature/v0.2.0-multi-select`)
- [ ] Add `'multiselect'` to `FieldType` union
- [ ] Add `MultiSelectConfig` type + Zod validator
- [ ] Create `TagInput` primitive in Layer 1
- [ ] Add to `PrimitiveComponents` + `PrimitivesContext` defaults
- [ ] Update `field-renderer.tsx` for `'multiselect'`
- [ ] Wire in showcase + create demo route
- [ ] `pnpm build` passes

### Slice 4: Column Reordering (`feature/v0.2.0-column-reordering`)
- [ ] Add `columnReorder` to `GridSchema`
- [ ] Integrate `@dnd-kit/core` + `@dnd-kit/sortable`
- [ ] Update `GridColumnHeader` with drag handles
- [ ] Create showcase demo
- [ ] `pnpm build` passes

### Slice 5: Form Wizard (`feature/v0.2.0-form-wizard`)
- [ ] Add `WizardSchema`, `WizardStep` types + Zod validators
- [ ] Create `SchemaWizard` renderer
- [ ] Step navigation UI (next/prev, step indicator)
- [ ] Per-step validation with TanStack Form
- [ ] Linear + non-linear step flow support
- [ ] Create showcase demo route
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