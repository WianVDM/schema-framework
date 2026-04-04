# Implementation Plan: TaskComplete Hook Rewrite

[Overview]
Rewrite the global `TaskComplete.ps1` hook from a 447-line over-engineered script to a minimal, workspace-agnostic post-task validator that quietly succeeds on clean tasks and uses `contextModification` to re-ignite the AI when files need rule-compliance review.

The current script dumps diagnostic logs, full rule file contents, and a massive enforcement message into every task completion — even successful ones. This wastes context tokens and provides no value on clean completions. The rewrite follows a "shut up on success, speak up when something needs attention" philosophy. It is workspace-agnostic: no project-specific logic, no hardcoded rule sets. It discovers rule files from standard locations, detects changed files via git, and injects a brief reference-based nudge only when there are changed files to verify against rules. It never cancels — it always returns `cancel: false`, trusting the AI to self-correct via injected context.

[Types]
No type system changes. The Cline hooks API contract remains:

**Input (stdin JSON):**
```json
{
  "taskId": "abc123",
  "hookName": "taskComplete",
  "workspaceRoots": ["C:/path/to/workspace"],
  "taskComplete": { "task": "the original task description" }
}
```

**Output (stdout JSON):**
```json
{
  "cancel": false,
  "contextModification": "text injected into AI conversation (empty string if nothing to say)",
  "errorMessage": ""
}
```

The script always returns `cancel: false`. The `contextModification` field is either a brief actionable message or an empty string.

[Files]

## Modified Files

### `C:\Users\User\Documents\Cline\Hooks\TaskComplete.ps1` (GLOBAL hook — complete rewrite)

This is a full rewrite. The file goes from 447 lines to approximately 60-80 lines. The new structure:

```
Lines 1-8:    Brief header comment (purpose + API contract summary)
Lines 9-20:   Read-HookInput function (unchanged, proven pattern)
Lines 21-35:  Get-WorkspaceRoot function (simplified from Resolve-WorkspaceRoot)
Lines 36-50:  Get-ChangedFiles function (single git strategy, no fallbacks)
Lines 51-60:  Get-RuleFiles function (discover rule file paths, not contents)
Lines 61-80:  Main execution block
```

**What is removed:**
- `Write-Diagnostic` function and entire diagnostic logging system
- `Get-RulesContent` function (read full rule file contents)
- `Build-EnforcementMessage` function (massive compliance message builder)
- 3-strategy file detection fallback (git status → git log → disk scan)
- 12+ rule path locations (Claude/Cursor/Windsurf paths)
- Verbose 37-line comment header
- All `INFO`/`WARN`/`ERROR` diagnostic messages
- The "MANDATORY RULE COMPLIANCE CHECK" enforcement template
- The "REQUIRED ACTIONS -- DO NOT SKIP" checklist
- The "COMPLIANCE REPORT FORMAT" section
- `cancel: true` logic (never cancels)

**What is added/replaced:**
- `Get-WorkspaceRoot` — simplified workspace root resolution (workspaceRoots[0] only, fallback to PWD)
- `Get-ChangedFiles` — single git diff strategy (staged + unstaged + untracked)
- `Get-RuleFiles` — discovers rule file paths (not contents) from `.clinerules/` (workspace) and `~/Documents/Cline/Rules/` (global)
- Conditional `contextModification` — brief message only when changed files exist AND rule files exist
- 5-line header comment: purpose + output format

### `docs/plans/hook-cleanup-agnostic.md` (superseded by this plan)

This previous plan is superseded. No action needed — it remains for historical reference.

[Functions]

## Removed Functions
- `Write-Diagnostic` (lines 47-62) — diagnostic logging, no longer needed
- `Resolve-WorkspaceRoot` (lines 86-130) — replaced by simpler `Get-WorkspaceRoot`
- `Get-RulesContent` (lines 132-181) — full content reading replaced by path discovery
- `Get-EditedFiles` (lines 183-275) — 3-strategy detection replaced by single git strategy
- `Build-EnforcementMessage` (lines 277-369) — massive message builder removed entirely

## New Functions

### `Get-WorkspaceRoot`
- **Signature:** `function Get-WorkspaceRoot($HookInput)`
- **File:** `C:\Users\User\Documents\Cline\Hooks\TaskComplete.ps1`
- **Purpose:** Resolves workspace root from Cline's `workspaceRoots[0]`, falls back to `$PWD`
- **Logic:** Check `workspaceRoots` array from hook input, use first entry. If unavailable, use `$PWD.Path`. No git fallback, no environment variable strategy.

### `Get-ChangedFiles`
- **Signature:** `function Get-ChangedFiles([string]$WorkspaceRoot)`
- **File:** `C:\Users\User\Documents\Cline\Hooks\TaskComplete.ps1`
- **Purpose:** Detects files changed during the task via git
- **Logic:** Single strategy: run `git diff --cached --name-only`, `git diff --name-only`, and `git ls-files --others --exclude-standard` in the workspace root. Combine, deduplicate, return. If git fails or returns nothing, return empty array.

### `Get-RuleFiles`
- **Signature:** `function Get-RuleFiles([string]$WorkspaceRoot)`
- **File:** `C:\Users\User\Documents\Cline\Hooks\TaskComplete.ps1`
- **Purpose:** Discovers rule file paths (not contents) from standard Cline locations
- **Logic:** Check two locations:
  1. Workspace: `.clinerules/` directory (and its `.md` files)
  2. Global: `~/Documents/Cline/Rules/` directory (and its `.md` files)
  Returns array of relative paths that exist. Does NOT read file contents.

## Unchanged Functions
- `Read-HookInput` — kept as-is, proven stdin parsing pattern

[Classes]
No class changes.

[Dependencies]
No dependency changes. The script uses only PowerShell built-in cmdlets and `git` (assumed available).

[Testing]
Validation is manual:
1. Verify the script outputs valid JSON on stdout
2. Test with a workspace that has changed files and rule files — confirm `contextModification` is populated
3. Test with a workspace that has no changed files — confirm `contextModification` is empty
4. Test with a workspace that has no rule files — confirm `contextModification` is empty
5. Confirm `cancel` is always `false` in all scenarios
6. Confirm no diagnostic noise is injected into the output

[Implementation Order]

1. Write the new `TaskComplete.ps1` script (complete rewrite via `write_to_file`)
2. Manually verify the script structure and logic
3. No build step needed — PowerShell scripts are interpreted