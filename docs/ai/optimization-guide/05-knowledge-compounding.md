# Module 05: Knowledge Compounding

> NOTE: Inspired by Karpathy's LLM Wiki pattern — feedback loops, activity tracking, and semantic lint that compound knowledge across sessions without increasing always-loaded tokens.

## Core Principle

Each AI session should leave the codebase smarter than it found it. Knowledge discovered during a session (behavioral patterns, non-obvious gotchas, data flow insights) should be captured in regenerable files that future sessions can leverage.

## Activity Tracking via `last-diff.json`

The `last-diff.json` file is extended with a `recentSessions` array that tracks recent development activity:

```json
{
  "recentSessions": [
    {
      "date": "2026-04-21",
      "type": "feature",
      "summary": "Added knowledge compounding module to AI optimization guide",
      "filesChanged": 5
    }
  ]
}
```

### Rules

- Auto-appended on each `--diff` generation run
- Auto-truncated to 5 most recent entries (FIFO)
- Type enum: `feature`, `fix`, `refactor`, `docs`, `chore`
- Summary max 80 characters
- Zero additional always-loaded tokens — only loaded when `last-diff.json` is read

### Value

Future sessions can see what was recently worked on, providing continuity without conversation history. This creates a lightweight activity log that helps the AI understand the current development trajectory.

## Semantic Freshness Lint (`--check` flag)

The `--check` flag runs 4 deterministic freshness checks that go beyond simple mtime comparison:

| # | Check | Severity | What it catches |
|---|-------|----------|-----------------|
| 1 | Missing files | Error | Source files not tracked in `.context.json` |
| 2 | Phantom exports | Error | Context entries for exports that no longer exist |
| 3 | Lazy descriptions | Warning | `desc` fields identical to export name (no human curation) |
| 4 | Stale timestamps | Warning | `generatedAt` >30 days old |

### CI Integration

```yaml
# GitHub Actions example
- name: Check AI context freshness
  run: node scripts/generate-ai-context/index.mjs --check
```

Exit code 0 if all pass, 1 if any violations. This ensures context files stay in sync with the codebase.

## Enhanced Flows Convention

When behavioral patterns are discovered during AI sessions (non-obvious runtime behaviors, unexpected data flows, error recovery patterns), capture them in `flows.json`:

```json
{
  "flows": {
    "behavior-recovery-pattern": {
      "trigger": "When FieldRenderer encounters unknown schema type",
      "steps": ["renderers/field-renderer.tsx → FallbackRenderer", "fallback → log warning + render text input"],
      "touches": ["console warning"],
      "errorPath": "Never throws — graceful degradation"
    }
  }
}
```

### Convention Rules

- Prefix behavioral flows with `behavior-` to distinguish from data flows
- 3-8 steps per flow
- Capture non-obvious behaviors the AI would not infer from code alone
- Update when behavior changes