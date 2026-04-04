# Workspace Behaviors

## Rule: "Read Before Write" (No Hallucinations)

Before modifying ANY existing file, you MUST use the `read_file` tool to view its current contents. DO NOT guess what is inside a file based on its name. If you try to edit a file you haven't read, you risk destroying existing code.

## Rule: "Plan-First for Cross-Layer Tasks"

If a user request requires changes across multiple layers (e.g., "Add a date picker that validates against a schema"), you MUST output a numbered step-by-step plan in your response FIRST. Do not start executing file changes until you have laid out the plan and the user approves it, or unless the user explicitly said "do it".

## Rule: Path Alias Paranoia (Crucial for Monorepos)

- In `apps/showcase`: `@/` maps to `apps/showcase/src/` (or root of showcase).
- In `packages/core`: DO NOT use `@/`. Use strict relative imports (e.g., `import { SchemaForm } from '../engine/renderers'`) OR configure a specific package alias like `#core/` in the core's `tsconfig.json`.
- NEVER assume `@/` in the core package points to the showcase app.

## Rule: "Documentation-First Context"

All new architectural documentation, implementation plans, and context maps MUST use Mermaid.js diagrams for any structural, relational, or flow-based information. This rule is enforced by the Diagram Standards section in `.clinerules/workspace-file-structure.md`.

- **Mermaid diagrams** are required for: layer dependencies, data flows, module relationships, request/response lifecycles
- **ASCII art diagrams** are prohibited in new documentation
- **Prose descriptions** should accompany diagrams for context, not replace them

### Bracket-Delimited Plan Sections

All new implementation plans in `docs/plans/` MUST use `[SectionName]` markers for section headings. This enables programmatic extraction and AI context loading. See ADR-002 in `docs/decisions/` for the full specification.

### Decision Records (ADRs)

Architectural decisions MUST be documented in `docs/decisions/` using the ADR format (see `docs/decisions/README.md`). Each decision gets a numbered file (`001-short-title.md`) with Status, Context, Decision, and Consequences sections.

## Rule: "Project Context Location"

All architectural truths and reference material are located in `ARCHITECTURE.md` (root) and the `docs/` folder. Always read `ARCHITECTURE.md` at the start of a task. Decision records are located in `docs/decisions/`.
