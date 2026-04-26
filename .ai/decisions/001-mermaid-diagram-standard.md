# ADR-001: Mermaid Diagram Standard

## Status
Accepted

## Context

The project's documentation uses three different formats for describing structural relationships and data flows:

1. **ASCII art diagrams** using box-drawing characters (`──►`, `│`, `▼`) in `docs/context-map.md` and code blocks
2. **Text-arrow notation** (`<-- uses-type -->`) in per-directory `.context.md` files
3. **Prose-only descriptions** in `ARCHITECTURE.md` for layer dependencies, state management, and lifecycles

These formats are functional but have significant drawbacks:

- **Not parseable by tooling** — ASCII art cannot be validated or transformed programmatically
- **Not renderable visually** — Text arrows only convey meaning when read carefully
- **Ambiguous for AI models** — The `<-- -->` notation is inconsistent and hard to interpret without human context
- **Not maintainable** — ASCII diagrams break alignment when node names change
- **No standard taxonomy** — Each diagram uses ad-hoc conventions

## Decision

Adopt **Mermaid.js** as the standard diagram syntax for all structural, relational, and flow-based documentation across the project.

### Diagram Taxonomy

| Diagram Type | Mermaid Syntax | Use Case |
|-------------|---------------|----------|
| Dependency graph | `graph TD` / `graph LR` | Layer dependencies, module relationships |
| Data flow | `graph TD` with styled nodes | Data movement through system layers |
| Sequence diagram | `sequenceDiagram` | Request/response flows, lifecycle events |
| Subgraph grouping | `subgraph` within `graph` | Grouping related components |

### Where Mermaid is Required

- `ARCHITECTURE.md` — All architectural descriptions of layers, flows, and strategies
- `docs/context-map.md` — Cross-layer dependency graphs and data flows
- Per-directory `.context.md` files — Internal relationship diagrams
- All future implementation plans and architectural documentation

### What is Replaced

- ASCII art diagrams (`──►`, `│`, `▼`) → Mermaid `graph` diagrams
- Text-arrow notation (`<-- uses-type -->`) → Mermaid labeled edges (`-->|uses-type|`)
- Prose-only structural descriptions → Mermaid diagrams alongside prose

### What is NOT Replaced

- Tables (File Inventory, comparison tables) remain as Markdown tables
- Code examples remain as fenced code blocks
- Prose descriptions are kept alongside diagrams for context

## Consequences

### What becomes easier

- **GitHub rendering** — Mermaid diagrams render natively on GitHub without extensions
- **VS Code rendering** — Mermaid renders in VS Code Markdown preview
- **AI comprehension** — Structured diagram syntax is easier for AI models to parse and generate
- **Maintenance** — Mermaid syntax is text-based and diff-friendly
- **Validation** — Mermaid syntax can be validated by linters and preview tools
- **Consistency** — All diagrams follow the same syntax and conventions

### What becomes more difficult

- **Raw readability** — Mermaid syntax is less readable than ASCII art in raw Markdown for humans unfamiliar with Mermaid
- **Learning curve** — Contributors need basic Mermaid knowledge
- **Complex diagrams** — Very large diagrams may need to be split into multiple smaller ones

### Mitigations

- Keep diagrams small and focused (one concern per diagram)
- Always include prose context above or below the diagram
- Use consistent edge labels matching the relationship types (`uses-type`, `implements`, `validates`, `renders`, `consumes`)