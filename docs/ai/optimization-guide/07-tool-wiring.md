# Module 07: Tool Wiring

> NOTE: Integration with AI coding tools. Each tool reads context files differently — wire accordingly.

## Cline Integration

### System Prompt Wiring
- `docs/ai/system.md` → loaded via Cline's system prompt configuration
- Always active, ~800 tokens

### Hook-Based Auto-Update
- **PostToolUse hook**: After file modifications, triggers `.context.json` regeneration for affected directories
- **TaskComplete hook**: Runs full compliance pipeline including context freshness check

### Skills System
- Skills in `.agents/skills/` are loaded on-demand by name matching
- Each skill has its own `SKILL.md` with focused instructions
- Token cost: ~400-500 tokens per skill, only when activated

### Compliance Hooks
- `.clinerules/workspace-*.json` → always-active rule files (~1,638 tokens total)
- Regex-based checks enforced by `rule-engine.mjs`
- Biome formatting enforced by `biome-runner.mjs`

## Cursor Integration

### .cursorrules File
Create `.cursorrules` that references `docs/ai/system.md`:
```
Read docs/ai/system.md first for architecture context.
Use docs/ai/symbol-index-manifest.json for symbol lookup.
Use docs/ai/file-placement.json when creating new files.
Use docs/ai/flows.json for data flow tracing.
```

### Context Loading
Cursor reads `.cursorrules` at conversation start. Reference Tier 2 files by name for on-demand loading.

## GitHub Copilot Integration

### .github/copilot-instructions.md
Create instructions file that mirrors `system.md` content:
```markdown
# Architecture
[Compressed architecture summary from system.md]

# File Placement
Reference docs/ai/file-placement.json for new file locations.
```

### Context Files
Copilot can reference files in `docs/ai/` through workspace indexing.

## Generic Integration Pattern

For any AI tool:
1. Identify the tool's "always loaded" configuration file
2. Put compressed architecture summary there (~800 tokens max)
3. Reference Tier 2 files for on-demand lookup
4. Wire the generation script into build/pre-commit hooks
5. Add `--check` flag to CI pipeline

## Wiring Checklist

- [ ] `system.md` (or equivalent) content is ≤800 tokens
- [ ] Generation script runs on build/pre-commit
- [ ] `--check` flag integrated into CI
- [ ] All Tier 2 files referenced by name in always-loaded config
- [ ] Hook-based auto-update configured (if tool supports hooks)