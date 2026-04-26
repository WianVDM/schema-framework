# Harness-Agnostic Hook Adapters

> NOTE: This directory documents how to wire the AI memory system hooks to different AI harnesses.

## Hook Protocol

All hooks communicate via **stdin JSON → stdout JSON**. The protocol is harness-specific at the adapter level, but the underlying scripts in `scripts/` are harness-agnostic.

### Universal Output Format

```json
{
  "cancel": false,
  "contextModification": "Optional context string injected into AI conversation"
}
```

### Supported Hook Points

| Hook | Trigger | Script | Purpose |
|------|---------|--------|---------|
| PreToolUse | Before each tool call | `scripts/shared/skill-patterns.mjs` | Skill reminders, never blocks |
| PostToolUse | After each tool call | `scripts/checks/context.mjs` + biome + rules | Self-healing findings |
| TaskComplete | AI signals completion | Full pipeline | Build + compliance + changeset + typecheck |
| PreCompact | Before context compression | `scripts/memory/compact.mjs` | Save working state |

## Harness-Specific Wiring

### Cline (`.clinerules/hooks/`)

Cline discovers hooks in `.clinerules/hooks/` by name:
- Windows priority: `.ps1` → `.mjs` → `.js`
- Input: `{hookName, workspaceRoots, preToolUse/postToolUse/taskComplete}` on stdin
- Output: `{cancel, contextModification}` on stdout

```powershell
# .clinerules/hooks/PreCompact.ps1
node .clinerules/hooks/PreCompact.mjs
exit $LASTEXITCODE
```

### Claude Code (`.claude/hooks/`)

Claude Code uses a similar JSON-over-stdin protocol. Create adapters that call the same scripts.

### Cursor / Codex

Use MCP tool definitions or shell integration to call scripts directly.

## Adding a New Harness

1. Create a hook adapter directory for the harness
2. Write thin adapters that:
   - Translate the harness's input format to the script's expected format
   - Call the appropriate script from `scripts/`
   - Translate the script's output to the harness's expected output format
3. No logic duplication — all logic lives in `scripts/`