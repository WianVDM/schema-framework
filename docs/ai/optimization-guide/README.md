# AI Optimization Guide — Modular Reference

> NOTE: Universal spec for building a token-efficient AI context system in any codebase.
> Read modules in order as needed — each is self-contained and portable.

## Philosophy

Token budgets are finite. Every token the AI spends reading context is a token it can't use for reasoning.
This guide produces a generation script + hand-crafted domain files that maximize AI effectiveness
within strict token budgets. The system is **fully regenerable** — no manual work is lost on regeneration.

## Module Map

| # | Module | Purpose | Tokens |
|---|--------|---------|--------|
| 01 | [Context Architecture](01-context-architecture.md) | Tiered context system design (Tier 0/1/2/3) | ~500 |
| 02 | [Context Generation](02-context-generation.md) | Script spec for auto-generating context files | ~2000 |
| 03 | [Context Schemas](03-context-schemas.md) | JSON Schema definitions for all generated files | ~1500 |
| 04 | [Enforcement Tiers](04-enforcement-tiers.md) | Three-tier enforcement architecture | ~400 |
| 05 | [Knowledge Compounding](05-knowledge-compounding.md) | Feedback loops, activity tracking, semantic lint | ~300 |
| 06 | [Behavior Capture](06-behavior-capture.md) | Key behaviors table, system.md enhancement | ~250 |
| 07 | [Tool Wiring](07-tool-wiring.md) | Integration with AI tools (Cline, Cursor, Copilot) | ~400 |
| 08 | [Validation](08-validation.md) | Validation checklist, token budgets, phase ordering | ~300 |

## Read Order

- **Building from scratch:** 01 → 02 → 03 → 04 → 07 → 08
- **Adding to existing project:** 01 → 05 → 06 → 07
- **Just enforcement:** 04 → 06 → 08
- **Just generation:** 02 → 03 → 05

## Templates

Copy-paste templates for new codebases:

- [`templates/token-budgets.json`](templates/token-budgets.json) — Token/line budgets
- [`templates/system.md.template`](templates/system.md.template) — Entry point template
- [`templates/flows.json.template`](templates/flows.json.template) — Data flows template

## Token Philosophy

- **Tier 0** (`system.md`): ≤800 tokens, always loaded
- **Tier 1** (`.context.json`): ≤200 tokens each, loaded per-directory
- **Tier 2** (analysis files): ≤400 tokens each, loaded on demand
- **Tier 3** (schemas): loaded only for validation
- **Always-active enforcement**: ≤1,638 tokens total