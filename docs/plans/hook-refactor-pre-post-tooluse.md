# Implementation Plan

[Overview]
Refactor PreToolUse.ps1 and PostToolUse.ps1 workspace hooks to match the clean, minimal style of the global TaskComplete.ps1 hook.

These two workspace hooks enforce 3-Layer Architecture constraints and auto-generate READMEs. They currently suffer from verbose block comments, ASCII separators, doc blocks on every function, and over-explaining inline comments. The PreToolUse hook also hard-blocks violations with `cancel: true`, which should change to advisory `contextModification` so the AI can self-correct without abandoning tasks.

[Types]
No type system changes. This is a PowerShell scripting refactor only.

The hook input/output JSON shapes remain the same:
- Input: `{ "preToolUse": { "tool": "...", "parameters": {...} } }` or `{ "postToolUse": { "tool": "...", "parameters": {...} } }`
- Output: `{ "cancel": false, "contextModification": "<message or empty>" }`

[Files]

### `.clinerules/hooks/PreToolUse.ps1` — Major refactor

Changes:
- Replace 30-line header block comment with 3-4 line summary (TaskComplete.ps1 style)
- Remove all `# ===` and `# ---` ASCII separator lines
- Remove all `<# .SYNOPSIS ... #>` doc blocks from functions
- Remove verbose inline comments (keep only NOTE/WARNING tagged ones where necessary)
- Remove `Deny-Action` function (no more `cancel: true`)
- Remove `Allow-Action` function — inline the JSON output
- Remove `Get-ToolContent` helper — inline the content extraction (3 lines)
- Remove dead `Test-DocsRoutingViolation` function (already excluded from rules array)
- Change main logic: instead of blocking on violation, return `cancel: false` with `contextModification` containing the violation message
- Shorten rule messages to be direct and concise (no "BLOCKED:", no doc references)
- Keep all 5 rule test functions intact with their regex logic
- Keep the `$rules` registry pattern (it's clean) but with shorter messages

### `.clinerules/hooks/PostToolUse.ps1` — Light cleanup

Changes:
- Replace 20-line header block comment with 3-4 line summary
- Remove all `# ===` and `# ---` ASCII separator lines
- Remove all `<# .SYNOPSIS ... #>` doc blocks from functions
- Remove verbose inline comments
- Inline `Test-ShouldIgnorePath` into the handler (simple pattern matching)
- Keep README auto-generation logic and template content intact
- Keep `$handlers` dispatch pattern

### Reference file (no changes): `C:\Users\User\Documents\Cline\Hooks\TaskComplete.ps1`

[Functions]

### PreToolUse.ps1 — Functions to remove
- `Deny-Action` — no longer needed (no hard-blocking)
- `Allow-Action` — replace with inline JSON output
- `Get-ToolContent` — inline the 3-line content extraction
- `Test-DocsRoutingViolation` — dead code (already excluded from rules)

### PreToolUse.ps1 — Functions to keep (simplified)
- `Read-HookInput` — keep as-is, remove doc block
- `Test-CoreImportViolation` — keep regex logic, remove doc block
- `Test-PathAliasViolation` — keep regex logic, remove doc block
- `Test-ShadcnHardcodeViolation` — keep regex logic, remove doc block
- `Test-PrimitiveLayerViolation` — keep regex logic, remove doc block
- `Test-EngineLayerViolation` — keep regex logic, remove doc block

### PostToolUse.ps1 — Functions to remove
- `Test-ShouldIgnorePath` — inline into handler

### PostToolUse.ps1 — Functions to keep (simplified)
- `Read-HookInput` — keep as-is, remove doc block
- `Invoke-ReadmeEnforcer` — keep logic, remove doc block, inline ignore check

[Classes]
No classes involved. PowerShell functions only.

[Dependencies]
No dependency changes. PowerShell standard library only.

[Testing]
Manual testing approach:
1. Open Cline panel, trigger a file write that would have been blocked (e.g., write a file in packages/core that imports from apps/)
2. Verify the hook returns `cancel: false` with a contextModification message instead of blocking
3. Trigger a `create_directory` call and verify README is still auto-generated
4. Verify no ASCII art, emojis, or unsupported characters appear in output

[Implementation Order]

1. Refactor PreToolUse.ps1 — rewrite with simplified header, remove blocking behavior, switch to contextModification, strip verbosity
2. Refactor PostToolUse.ps1 — rewrite with simplified header, inline helper, strip verbosity
3. Verify both scripts are valid PowerShell (no syntax errors)