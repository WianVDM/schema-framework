# Module 08: Validation

> NOTE: Validation checklist, token budgets, and implementation phase ordering.

## Validation Checklist

After implementing the AI context system, verify:

- [ ] `docs/ai/system.md` ≤800 tokens, contains architecture + key behaviors
- [ ] All `.context.json` files have `$schema`, `layer`, `purpose`, `language`, `files`
- [ ] `purpose` field is human-curated (not auto-generated placeholder)
- [ ] All Tier 2 files validate against their schemas in `docs/ai/schemas/`
- [ ] No `.context.json` file exceeds 200 tokens
- [ ] No Tier 2 file exceeds its token budget (see Module 01)
- [ ] `symbol-index-manifest.json` total matches sum of per-layer counts
- [ ] `impact-graph.json` has no orphan entries (all paths resolve)
- [ ] `insights.json` circular warnings have been reviewed
- [ ] `community-map.json` cohesion scores are ≥0.3
- [ ] `--check` flag passes with exit code 0
- [ ] Hand-crafted Tier 2 files (`file-placement.json`, `flows.json`) are present
- [ ] Generation script is wired into build/pre-commit
- [ ] `recentSessions` in `last-diff.json` tracks activity (when `--diff` used)
- [ ] Key behaviors table in `system.md` has ≤8 rows

## Token Budget Summary

| Budget | Limit | Current | Status |
|--------|-------|---------|--------|
| system.md | 800 tokens | ~800 | ✅ |
| .context.json (each) | 200 tokens | ~150 | ✅ |
| Always-active rules | 2,000 tokens | ~1,638 | ✅ |
| Skills (each, on-demand) | 500 tokens | ~400 | ✅ |
| **Total always-loaded** | **3,000 tokens** | **~2,438** | ✅ |

## Phase Ordering (New Project)

### Phase 1: Foundation (Day 1)
1. Create `docs/ai/` directory structure
2. Write `system.md` with compressed architecture
3. Create generation script with basic `.context.json` output
4. Add `file-placement.json` with project-specific rules

### Phase 2: Auto-Generation (Day 1-2)
5. Implement symbol index generation
6. Implement impact graph generation
7. Implement insights generation (cross-layer deps, cycles)
8. Wire into build system

### Phase 3: Refinement (Day 2-3)
9. Add `flows.json` for key data flows
10. Implement `--check` flag for CI
11. Implement `--diff` flag with `recentSessions` tracking
12. Add key behaviors table to `system.md`

### Phase 4: Optimization (Ongoing)
13. Curate `.context.json` `desc` fields (replace lazy descriptions)
14. Add `community-map.json` generation
15. Add `error-taxonomy.json` and `config-schema.json` as needed
16. Tune token budgets based on actual usage

## Compliance Integration

The AI context system integrates with the compliance pipeline:

```
PostToolUse → context regen for modified directory
TaskComplete → full build → biome fix → compliance → changeset → typecheck
```

The compliance system validates:
- Rule engine checks (`.clinerules/workspace-*.json`)
- Biome formatting and lint
- Health checks (context freshness, barrel purity, filename convention, etc.)