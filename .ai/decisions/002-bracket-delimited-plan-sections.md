# ADR-002: Bracket-Delimited Plan Sections

## Status
Accepted

## Context

Implementation plans in `docs/plans/` use an ad-hoc structure. Some plans use Markdown headings, others use a mix of headings and freeform prose. There is no consistent format that allows for:

- **Programmatic extraction** — No way to extract specific sections (e.g., "just the file changes") via regex or tooling
- **AI context loading** — AI models cannot efficiently jump to relevant sections without scanning the entire document
- **Cross-plan comparison** — Different plans use different section names and ordering, making it hard to compare scopes

The current `docs/plans/mermaid-documentation-standard.md` plan introduced `[SectionName]` markers as an experiment, and this pattern proved effective for section navigation.

## Decision

All new implementation plans in `docs/plans/` MUST use bracket-delimited section markers as the primary structural element. Each plan MUST include the following sections in this order:

### Required Sections

| Marker | Purpose | Content |
|--------|---------|---------|
| `[Overview]` | Scope, context, and approach | Why this change is needed and the general strategy |
| `[Types]` | Type system changes | New types, modified interfaces, type removals |
| `[Files]` | File modifications | Files to create, modify, or delete with specific changes |
| `[Functions]` | Function modifications | New functions, signature changes, removals |
| `[Classes]` | Class modifications | New classes, method changes, inheritance changes |
| `[Dependencies]` | Package changes | New npm packages, version bumps, removals |
| `[Testing]` | Validation approach | How to verify the changes work correctly |
| `[Implementation Order]` | Step sequence | Numbered list of steps in execution order |

### Rules

1. **Every marker appears exactly once** — No duplicate sections
2. **Markers are on their own line** — Format: `[SectionName]` with a blank line before and after
3. **Optional sections can be empty** — Write "No changes." if a section has no content (e.g., `[Functions] No functions are modified.`)
4. **`[Implementation Order]` is always last** — It summarizes the execution sequence
5. **Content between markers is standard Markdown** — Tables, code blocks, lists, and diagrams are all valid within sections

### Section Extraction

Sections can be extracted using regex patterns:

```
# Extract a section and its content up to the next section marker
sed -n '/\[SectionName\]/,/\[NextSection\]/p' docs/plans/plan-name.md | head -n -1
```

## Consequences

### What becomes easier

- **Programmatic access** — Any tool or script can extract specific sections by marker name
- **AI context management** — The AI model can request only relevant sections instead of loading entire plans
- **Consistency** — All plans follow the same structure, making them easier to review and compare
- **Plan validation** — Can verify a plan has all required sections before approving it

### What becomes more difficult

- **Rigid structure** — Plans that don't fit neatly into the section taxonomy may feel forced
- **Migration** — Existing historical plans use different formats (these are kept as-is)

### Mitigations

- The section list covers the vast majority of implementation tasks
- Empty sections are explicit ("No changes.") rather than omitted, maintaining the structure
- Historical plans are not migrated — the standard applies to new plans only