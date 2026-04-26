# Module 04: Enforcement Tiers

> NOTE: Three-tier enforcement architecture that minimizes AI context token usage while maintaining high enforcement quality.

## Architecture Overview

This project uses a three-tier enforcement architecture to minimize AI context token usage while maintaining high enforcement quality.

### Tier 1: Tools/Scripts (Zero AI Tokens)

Deterministic checks with no exceptions, enforced by compliance engine and biome:
- Architecture import boundaries (primitives → engine)
- Filename conventions (kebab-case matching export)
- Barrel file purity (only re-exports)
- Comment prefix auto-fix (bare → `NOTE:` prefixed)
- Formatting, imports, complexity (biome)

### Tier 2: Skills (~400-500 tokens, On-Demand)

Judgment-required patterns loaded only when relevant:
- `coding-standards` — naming, error handling, immutability, type safety, `as unknown as` guidance
- `code-review` — enterprise standards, security, performance review criteria
- `documentation` — Mermaid diagrams, ADR format, `.context.json` standards

### Tier 3: Rules (~200-300 tokens, Always Active)

Terse pointers in `.clinerules/workspace-*.json` files:
- Skill activation pointers
- Critical constraints (no direct commits to main, branch naming)
- TaskComplete configuration

## Token Budget

| Source | Est. Tokens | When Loaded |
|--------|------------|-------------|
| Global coding-standards.md | ~588 | Every conversation |
| workspace-coding-standards.json | ~263 | Every conversation |
| workspace-documentation-standards.json | ~98 | Every conversation |
| workspace-file-structure.json | ~298 | Every conversation |
| workspace-immutability-constraints.json | ~195 | Every conversation |
| workspace-versioning.json | ~118 | Every conversation |
| workspace-workflows.json | ~78 | Every conversation |
| **Total Always Active** | **~1,638** | **Always active** |

Skills consume ~400-500 tokens each but only when activated.

## File Inventory

### Skills (`.agents/skills/`)

| Skill | Purpose |
|-------|---------|
| `coding-standards` | Detailed coding patterns, naming, type safety, immutability |
| `code-review` | Review checklist, enterprise standards, security criteria |
| `documentation` | Mermaid diagrams, ADR format, context maps |
| `new-primitive` | Workflow B: Layer 1 primitive creation |
| `new-schema-type` | Workflow C: New FieldType addition |
| `modify-schema` | Workflow D: Schema field modification |
| `version-aware-dev` | Workflow G: Version-aware development |
| `milestone-completion` | Workflow H: Milestone completion |
| `planning` | Workflow F: Pre-implementation planning |
| `doc-sync` | Workflow I: Documentation synchronization |

### Compliance Checks (`scripts/compliance-check/`)

| Check | Purpose |
|-------|---------|
| `filename-convention.mjs` | kebab-case matching primary export |
| `barrel-purity.mjs` | Barrel files only re-export |
| `rule-engine.mjs` | Regex checks + comment prefix auto-fix |
| `biome-runner.mjs` | Biome single-file and full-project |

### Biome Rules

| Rule | Purpose |
|------|---------|
| `complexity/useMaxParams` | Max 4 parameters per function |

### TypeScript Config

| Setting | Purpose |
|---------|---------|
| `noUncheckedIndexedAccess: true` | Require bounds checking on array/object access |