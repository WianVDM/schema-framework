# Implementation Plan: Mermaid Diagram Standards & AI-Optimized Documentation

[Overview]
Enforce Mermaid.js diagrams as the standard for all structural, relational, and flow-based documentation across the project, replacing ASCII art and prose-only descriptions with machine-parseable, renderable diagrams.

This plan updates 7 existing documentation/config files to incorporate Mermaid diagrams, establishes an enforcement rule in `.clinerules/`, and introduces two additional AI-friendly documentation patterns: Decision Records (ADRs) for capturing architectural rationale, and standardized bracket-delimited section markers for all new implementation plans. The project currently relies on ASCII arrow diagrams (`──►`, `<-- uses-type -->`) and prose descriptions in `ARCHITECTURE.md`, `docs/context-map.md`, and per-directory `.context.md` files. These are functional but not parseable by tooling, not renderable visually, and ambiguous for AI models interpreting relationships. Mermaid diagrams provide precise, unambiguous representations that render on GitHub, VS Code (with extension), and most Markdown viewers.

[Types]
No TypeScript type changes. This plan modifies Markdown documentation files and `.clinerules/` YAML-based rule files only.

The following diagram types will be introduced:

### Mermaid Diagram Taxonomy

| Diagram Type | Mermaid Syntax | Use Case | Applied In |
|-------------|---------------|----------|------------|
| Dependency graph | `graph TD` / `graph LR` | Layer dependencies, module relationships | ARCHITECTURE.md, context-map.md, .context.md files |
| Data flow | `graph TD` with styled nodes | Data movement through system layers | ARCHITECTURE.md §4, context-map.md |
| Sequence diagram | `sequenceDiagram` | Request/response flows, lifecycle events | ARCHITECTURE.md §6 |
| Subgraph | `subgraph` within `graph` | Grouping related components | ARCHITECTURE.md §5 |
| Class diagram | `classDiagram` | Type hierarchy and interface relationships | Future use in type documentation |

### Decision Record Format (ADR)

```markdown
# ADR-[NUMBER]: [TITLE]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?
```

### Bracket-Delimited Section Markers

All new implementation plans MUST use `[SectionName]` markers (already established pattern in existing plans). This plan formalizes the convention:
- `[Overview]` — Scope, context, and approach
- `[Types]` — Type system changes
- `[Files]` — File modifications
- `[Functions]` — Function modifications
- `[Classes]` — Class modifications
- `[Dependencies]` — Package changes
- `[Testing]` — Validation approach
- `[Implementation Order]` — Step sequence

[Files]

## Files to Modify

### 1. `ARCHITECTURE.md`
**Changes:** Replace prose/ASCII descriptions with 6 Mermaid diagrams while preserving all existing prose context.

- **§2 (3-Layer Architecture):** Add a `graph TD` diagram showing Layer 1 → Layer 2 → Layer 3 with "FORBIDDEN" styled reverse arrows. Keep existing prose descriptions above the diagram.
- **§4 (State Management Strategy):** Add a `graph TD` data flow diagram showing Server → TanStack Query → Form/Table/Zustand connections. Keep the existing comparison table.
- **§5 (Shadcn Dependency Rule):** Add a `graph LR` injection flow diagram: Showcase → PrimitivesContext → Renderers. Keep existing code examples.
- **§6 (Workflow & Lifecycle):** Replace the two numbered lists with `sequenceDiagram` or `graph LR` with `subgraph` blocks for Local Dev and Production flows.
- **§7 (Immutability Strategy):** Add a `graph TD` showing compile-time vs runtime immutability layers. Keep existing code examples.
- **New §8 (Decision Records):** Add section referencing `docs/decisions/` and the ADR format.

### 2. `docs/context-map.md`
**Changes:** Replace ASCII dependency graphs with Mermaid diagrams.

- **Cross-Layer Dependency Graph:** Replace the ASCII art (lines 21-29) with a `graph TD` Mermaid diagram showing types → validators → context → helpers → renderers with labeled edges.
- **Data Flow:** Replace the ASCII art (lines 45-51) with a `graph TD` Mermaid diagram showing data/ → server/ → routes/ → core renderers flow.
- **Layer 3 Data Flow:** Add a separate `graph TD` for the showcase app's internal data flow.
- Keep all existing tables (they work well for AI consumption alongside diagrams).

### 3. `packages/core/src/engine/types/.context.md`
**Changes:** Add a Mermaid internal relationship diagram.

- Add a `graph TD` showing all 26+ type files and their `uses-type` relationships.
- The diagram replaces the text-based `- file.ts <-- uses-type --> file.ts` lines (lines 35-45).
- Keep the File Inventory table.

### 4. `packages/core/src/engine/helpers/.context.md`
**Changes:** Add a Mermaid internal relationship diagram.

- Add a `graph TD` showing `deep-freeze.ts`, `i18n.ts`, and `index.ts` relationships.
- Keep the File Inventory table.

### 5. `apps/showcase/src/.context.md`
**Changes:** Add Mermaid diagrams for internal and external relationships.

- Add a `graph TD` showing route → data → server → store relationships.
- Add a `graph LR` showing external dependencies on `@my-framework/core`.
- Replace the text-based relationship lines (lines 80-95).
- Keep the File Inventory tables.

### 6. `.clinerules/workspace-file-structure.md`
**Changes:** Add "Diagram Standards" section and update `.context.md` template.

- **New section "## Diagram Standards"** after the existing "## Context Maps" section:
  - Mandate Mermaid diagrams for all structural, relational, and flow-based documentation
  - Define which diagram types to use for which purposes (dependency graphs, data flows, sequences)
  - Require Mermaid in `.context.md` files for internal relationships
  - Require Mermaid in `docs/context-map.md` for cross-layer relationships
  - Require Mermaid in `ARCHITECTURE.md` for all architectural descriptions
  - Prohibit ASCII art diagrams (e.g., `──►`, `<-- -->`) for any new documentation
- **Update `.context.md` template** to include a Mermaid diagram block:
  ```markdown
  ## Internal Relationships
  
  ```mermaid
  graph TD
      file-a.ts -->|uses-type| file-b.ts
  ```
  ```
- **Add enforcement rules** to the existing "## Enforcement" section

### 7. `.clinerules/workspace-behaviors.md`
**Changes:** Add "Documentation-First Context" rule.

- **New rule "Documentation-First Context":** Mandate that all new architectural documentation, implementation plans, and context maps use Mermaid diagrams for any structural/relational/flow information.
- **Formalize bracket-delimited sections** as the standard for all implementation plans in `docs/plans/`.
- **Reference Decision Records** as the standard format for `docs/decisions/`.

## New Files to Create

### 8. `docs/decisions/README.md`
**Purpose:** Index file for all architectural decision records. Explains the ADR format and lists all decisions.

### 9. `docs/decisions/001-mermaid-diagram-standard.md`
**Purpose:** First decision record documenting the decision to adopt Mermaid.js as the diagram standard. Serves as a template/example for future ADRs.

### 10. `docs/decisions/002-bracket-delimited-plan-sections.md`
**Purpose:** Decision record formalizing the `[SectionName]` convention for implementation plans.

## Files NOT Modified (Historical Plans)

The following implementation plans are completed/historical and will NOT be updated:
- `docs/plans/implementation_plan.md`
- `docs/plans/phase2-implementation-plan.md`
- `docs/plans/phase3-implementation.md`
- `docs/plans/immutable-persistent-design-enforcement.md`
- `docs/plans/architecture-alignment.md`
- `docs/plans/architecture-restructure-and-validator-fixes.md`
- `docs/plans/coderabbit-review-fixes.md`
- `docs/plans/engine-and-renderers.md`
- `docs/plans/file-structure-rule.md`
- `docs/plans/hook-cleanup-agnostic.md`
- `docs/plans/hook-refactor-pre-post-tooluse.md`
- `docs/plans/taskcomplete-hook-rewrite.md`

These are kept as-is for historical reference. The new standard applies to all future plans.

[Functions]
No functions are modified. This plan affects documentation files and configuration rules only.

[Classes]
No classes are affected. This plan affects documentation files and configuration rules only.

[Dependencies]
No new npm packages or external dependencies are required. Mermaid.js is a Markdown-embedded syntax that renders natively on GitHub and in VS Code (with the Mermaid extension or built-in preview). No build tooling changes are needed.

[Testing]
Validation is performed by visual inspection:

1. **GitHub rendering:** Push changes and verify all Mermaid diagrams render correctly on GitHub (both in file view and README rendering)
2. **VS Code preview:** Open each modified `.md` file and verify Mermaid diagrams render in the Markdown preview pane
3. **Context preservation:** Verify that the AI model can extract the same (or better) relationship information from Mermaid diagrams as it could from the previous ASCII art
4. **Enforcement verification:** Confirm that the `.clinerules` updates are syntactically valid and don't break Cline's rule loading
5. **No content loss:** Verify that no prose descriptions or tables were removed — only ASCII art was replaced with Mermaid equivalents

[Implementation Order]

1. **Create `docs/decisions/` directory structure:**
   - Create `docs/decisions/README.md` with ADR format explanation and index
   - Create `docs/decisions/001-mermaid-diagram-standard.md` (the decision itself)
   - Create `docs/decisions/002-bracket-delimited-plan-sections.md` (formalizing plan format)

2. **Update `.clinerules/workspace-file-structure.md`:**
   - Add "## Diagram Standards" section with Mermaid mandates and diagram type taxonomy
   - Update `.context.md` template to include Mermaid diagram block
   - Add diagram enforcement rules to existing "## Enforcement" section
   - Prohibit new ASCII art diagrams

3. **Update `.clinerules/workspace-behaviors.md`:**
   - Add "Documentation-First Context" rule mandating Mermaid for architectural docs
   - Formalize bracket-delimited sections as the plan standard
   - Reference `docs/decisions/` as the ADR location

4. **Update `ARCHITECTURE.md`:**
   - Add Mermaid diagram to §2 (3-Layer Architecture)
   - Add Mermaid diagram to §4 (State Management)
   - Add Mermaid diagram to §5 (Shadcn Injection)
   - Add Mermaid diagrams to §6 (Workflow & Lifecycle)
   - Add Mermaid diagram to §7 (Immutability Strategy)
   - Add §8 referencing Decision Records

5. **Update `docs/context-map.md`:**
   - Replace ASCII Cross-Layer Dependency Graph with Mermaid
   - Replace ASCII Data Flow with Mermaid
   - Add Mermaid for Layer 3 showcase data flow

6. **Update per-directory `.context.md` files:**
   - Replace text relationships in `packages/core/src/engine/types/.context.md` with Mermaid
   - Replace text relationships in `packages/core/src/engine/helpers/.context.md` with Mermaid
   - Replace text relationships in `apps/showcase/src/.context.md` with Mermaid

7. **Final verification:**
   - Review all modified files for correct Mermaid syntax
   - Verify no content was lost during conversion
   - Confirm `.clinerules` files are syntactically valid