# Architectural Decision Records (ADRs)

This directory contains all architectural decision records for the Schema Framework project. Each decision is documented in a separate file following a standardized format.

## ADR Format

Every decision record follows this structure:

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

## Naming Convention

Files are numbered sequentially: `001-short-title.md`, `002-short-title.md`, etc.

## Index

| Number | Title | Status |
|--------|-------|--------|
| 001 | [Mermaid Diagram Standard](001-mermaid-diagram-standard.md) | Accepted |
| 002 | [Bracket-Delimited Plan Sections](002-bracket-delimited-plan-sections.md) | Accepted |
| 003 | [SemVer Changesets](003-semver-changesets.md) | Accepted |
| 004 | [Version Branch Strategy (Staging Branches)](004-version-branch-strategy.md) | Superseded by ADR-005 |
| 005 | [Versioned GitHub Flow](005-versioned-github-flow.md) | Accepted |
| 006 | [AI Context System Optimization](006-ai-context-optimization.md) | Accepted |
| 007 | [Layout System Architecture](007-layout-architecture.md) | Accepted |
