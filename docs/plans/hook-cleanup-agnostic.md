# Implementation Plan: Hook Cleanup — Workspace-Agnostic & No Cross-Hook References

[Overview]
Clean up all Cline hook scripts to ensure the global hook (TaskComplete.ps1) is fully workspace-agnostic with no cross-hook or workspace-specific references, and workspace hooks (PreToolUse.ps1, PostToolUse.ps1) contain no cross-hook references. Also remove all emojis and decorative characters from AI-facing output across all hooks.

[Types]
No type changes — this is a comment and text-only cleanup task.

[Files]

## New Files
- `docs/plans/hook-cleanup-agnostic.md` — This plan document

## Modified Files

### 1. `C:\Users\User\Documents\Cline\Hooks\TaskComplete.ps1` (GLOBAL hook)

**Header comment (lines 14):**
- Current: `"Even with PreToolUse blocking and PostToolUse auto-corrections"`
- Fix: Remove hook names, use generic wording: `"Even with pre-write validation and post-write corrections"`

**Header comment (lines 38-41) — "ROLE IN THE ENFORCEMENT CHAIN" section:**
- Remove entire section. It explicitly names PreToolUse.ps1 and PostToolUse.ps1.
- The "CLINE API CONTRACT" section provides sufficient context about this hook's role.

**Enforcement message (line 361):**
- Current: `"Workflow requirements are followed (build checks, plan files)"`
- Fix: `"Workflow requirements are followed where applicable"`

**Enforcement message (lines 328-376) — decorative markers:**
- Remove `[!]` decorative markers from headings
- Replace heavy `======` separator lines with structured markdown headings
- Keep the message structured and machine-readable without visual noise

### 2. `.clinerules/hooks/PreToolUse.ps1` (WORKSPACE hook)

**Comment (lines 256-257):**
- Current: `"NOTE: DocsRoutingViolation is intentionally omitted from block rules. It's a softer constraint best enforced by PostToolUse or TaskComplete"`
- Fix: `"NOTE: DocsRoutingViolation is intentionally omitted from block rules. It is a softer constraint better suited to post-task review."`

### 3. `.clinerules/hooks/PostToolUse.ps1` (WORKSPACE hook)

**README template (line 137):**
- Current: `"## 🚫 FORBIDDEN"`
- Fix: `"## FORBIDDEN"`

[Functions]
No function signature or logic changes — all changes are in comments and string literals.

[Classes]
No class changes.

[Dependencies]
No dependency changes.

[Testing]
Validation is manual:
1. Search all three files for any remaining references to other hook filenames
2. Search all three files for emoji characters
3. Verify TaskComplete.ps1 contains no workspace-specific terminology
4. Verify no logic was accidentally changed

[Implementation Order]

1. Create this plan document at `docs/plans/hook-cleanup-agnostic.md`
2. Edit `C:\Users\User\Documents\Cline\Hooks\TaskComplete.ps1` — header comment cleanup (cross-hook refs + enforcement chain section)
3. Edit `C:\Users\User\Documents\Cline\Hooks\TaskComplete.ps1` — enforcement message cleanup (workspace-specific refs + decorative chars)
4. Edit `.clinerules/hooks/PreToolUse.ps1` — remove cross-hook references in comments
5. Edit `.clinerules/hooks/PostToolUse.ps1` — remove emoji from README template
6. Verify all files are clean with grep searches