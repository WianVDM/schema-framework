# Module 06: Behavior Capture

> NOTE: Compressed key behaviors table in `system.md` — zero additional always-loaded tokens.

## Key Behaviors Table

A compressed table embedded in `system.md` that captures non-obvious behavioral patterns discovered during AI sessions. This is the highest-leverage knowledge compounding mechanism because `system.md` is always loaded.

### Table Format

```markdown
## Key Behaviors
| Pattern | Trigger | Response | Learned From |
|---------|---------|----------|-------------|
| Graceful degradation | Unknown schema type | FallbackRenderer + warning | Task 2026-04-15 |
| Schema-first defaults | Missing optional fields | Apply schema defaults, never null | Task 2026-04-10 |
```

### Rules

- Maximum 8 rows (~80 additional tokens)
- Each row ≤ 30 characters per cell
- `Learned From` column: task date or PR number
- Add rows when AI discovers non-obvious runtime behavior
- Remove rows when behavior becomes obvious from code or is fixed
- Maintenance responsibility: `doc-sync` skill

### What to Capture

- Unexpected fallback paths
- Non-obvious error recovery
- Default value behavior that differs from intuition
- Runtime behavior that contradicts type signatures
- Performance characteristics invisible from code

### What NOT to Capture

- Things obvious from reading the code
- Things already documented in ADRs or code comments
- Transient debugging observations