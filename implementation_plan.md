# Implementation Plan

[Overview]
Refactor the compliance system from fragmented preToolUse/postToolUse/taskComplete checks into a unified rule engine with biome-first enforcement, strict adherence via PostToolUse blocking, and full-project validation at TaskComplete.

The current system has three sources of duplication: (1) biome rules overlap with custom rule checks (e.g., `noExplicitAny` in biome vs `no-any-unknown` in rules), (2) the `preToolUse`/`postToolUse`/`taskComplete` sections in 6 workspace rule files were designed to be loaded dynamically by hooks but the hooks are entirely hardcoded and never read them, and (3) the compliance-check scripts do full-project validation that partially overlaps with what the hooks should do. This plan consolidates everything into a single rule schema, a biome-first strategy, a reusable rule engine module, and two clean hooks (PostToolUse for per-file, TaskComplete for full-project). Build lifecycle scripts (`prebuild`/`postbuild`) are removed since validation moves to TaskComplete explicitly.

[Types]

The rule file schema changes from v1 to v2. All rule files adopt this unified structure:

```typescript
// NOTE: Rule file schema v2 — unified check model
interface WorkspaceRuleFile {
  name: string
  version: 2
  checks?: RuleCheck[]
  directives: string[]
}

interface RuleCheck {
  id: string                    // Unique identifier (e.g., "no-unknown-type")
  scope: string                 // Glob-like path pattern (e.g., "packages/core/src/**")
  fileMatch: string[]           // File extensions to check (e.g., ["ts", "tsx"])
  pattern: string               // Regex pattern to detect violations
  message: string               // Violation message shown to AI
  rationale: string             // Why this rule exists
}

// NOTE: Suppression model — inline comment on violating line or line above
// Format: // compliance-ignore <check-id>: NOTE: <reason>
// Example: // compliance-ignore no-unknown-type: NOTE: third-party API returns untyped response
```

Key schema changes from v1:
- `preToolUse`, `postToolUse`, `taskComplete` → unified `checks[]` array
- `enforcement` field removed — everything blocks, suppression is the only escape hatch
- `negativePattern` removed — replaced by explicit suppression comments
- Process-level reminders (git safety, changeset reminders) → moved to `directives[]`
- `taskComplete` config (typecheckCmd, complianceScript, changesetRequired) → moved to directives in workspace-workflows.json (hooks read it directly)

Violation severity model:
- All violations are errors (blocking)
- Biome warnings elevated to errors via biome.json config
- Project health issues (stale context, missing changelogs) are also blocking
- Only exceptions: suppression comments with reasoned justification

[Files]

## Rule Files — Modified (6 files)

**`.clinerules/workspace-coding-standards.json`**
- Bump `version` to 2
- Remove `preToolUse` array, `postToolUse: null`, `taskComplete: null`
- Add `checks` array containing only non-biome checks:
  - `no-unknown-type` — catches `: unknown` in packages/core/src (biome has no rule for this)
  - `path-alias-violation` — catches `../../` imports in packages/core/src
  - `no-bare-comments` — catches bare `//` comments without prefixes
- Remove `no-any-unknown` check entirely (biome `noExplicitAny: error` handles `any`)
- Move `no-implicit-git-commit` to directives (was process-level, not file-content check)
- Add directive about strict adherence with reasoned exceptions

**`.clinerules/workspace-documentation-standards.json`**
- Bump `version` to 2
- Remove `preToolUse: null`, `postToolUse: null`, `taskComplete: null`
- No `checks` array (documentation standards are directives-only, enforced by AI)
- Directives unchanged

**`.clinerules/workspace-file-structure.json`**
- Bump `version` to 2
- Remove `preToolUse` array, `postToolUse: null`, `taskComplete: null`
- Add `checks` array containing:
  - `core-import-violation` — primitives MUST NOT import from engine
  - `primitive-layer-violation` — engine MUST import primitives via barrel re-exports
- Move `core-change-missing-changeset` to directives (was reminder, not file-content check)
- Move `plan-directory-rule` to directives (informational)

**`.clinerules/workspace-immutability-constraints.json`**
- Bump `version` to 2
- Remove `preToolUse` array, `postToolUse: null`, `taskComplete: null`
- Add `checks` array containing:
  - `no-nextjs-app-router` — forbid `next/(app|navigation)` imports
  - `no-tailwind-npm` — forbid @mui/@chakra/antd imports
  - `no-business-logic-in-core` — forbid business terms in packages/core

**`.clinerules/workspace-versioning.json`**
- Bump `version` to 2
- Remove `preToolUse` array (contained only `no-implicit-git-commit`, moved to directives)
- Remove `postToolUse: null`, `taskComplete: null`
- No `checks` array (all versioning rules are directives)
- Directives gain the moved git safety rule

**`.clinerules/workspace-workflows.json`**
- Bump `version` to 2
- Remove `taskComplete` object (typecheckCmd, complianceScript, changesetRequired)
- Remove `preToolUse: null`, `postToolUse: null`
- No `checks` array
- Move taskComplete config values to directives as structured entries
- Directives unchanged otherwise

### Scripts — New Files (2 files)

**`scripts/compliance-check/rule-engine.mjs`**
- Loads all `workspace-*.json` rule files from `.clinerules/`
- Exports `loadRules(workspaceRoot)` → returns array of all RuleCheck objects
- Exports `checkFile(filePath, content, rules)` → returns violations for a single file
  - Filters rules by scope + fileMatch against filePath
  - Runs regex pattern line-by-line
  - Checks for suppression comments (`// compliance-ignore <check-id>:`)
  - Returns array of `{ id, message, line, rationale }` violations
- Exports `checkProject(workspaceRoot, rules)` → returns violations for entire codebase
  - Walks all source directories from `SCAN_ROOTS`
  - Runs `checkFile` against each source file
  - Returns aggregated violations array

**`scripts/compliance-check/biome-runner.mjs`**
- Exports `checkFile(filePath)` → runs `npx biome check <filepath>` for single file
- Exports `checkProject(workspaceRoot)` → runs `npx biome check .` for full project
- Parses biome output for error counts
- Returns array of violation strings

### Scripts — Reorganized (5 files moved to checks/ subdirectory)

**`scripts/compliance-check/checks/context-freshness.mjs`**
- Moved from `scripts/compliance-check/check-context-freshness.mjs`
- Updated imports to use `../../shared/constants.mjs` (one level deeper)
- Updated imports to use `../../shared/file-helpers.mjs`
- Logic unchanged

**`scripts/compliance-check/checks/context-governance.mjs`**
- Moved from `scripts/compliance-check/check-context-governance.mjs`
- Updated imports
- Logic unchanged

**`scripts/compliance-check/checks/changelogs.mjs`**
- Moved from `scripts/compliance-check/check-changelogs.mjs`
- Updated imports
- Logic unchanged

**`scripts/compliance-check/checks/version-status.mjs`**
- Moved from `scripts/compliance-check/check-version-status.mjs`
- Updated imports
- Logic unchanged

**`scripts/compliance-check/checks/symbol-uniqueness.mjs`**
- Moved from `scripts/compliance-check/check-symbol-uniqueness.mjs`
- Updated imports
- Logic unchanged

### Scripts — Modified (1 file)

**`scripts/compliance-check/index.mjs`**
- Remove `checkBiome` import (replaced by `biome-runner.mjs`)
- Remove old `check-*.mjs` imports (replaced by `checks/*.mjs`)
- Import from new modules: `rule-engine.mjs`, `biome-runner.mjs`, `checks/*.mjs`
- Orchestrates: load rules → check project → run biome → run project health checks
- Used by `pnpm compliance` command and by TaskComplete hook

### Scripts — Deleted (7 files)

- `scripts/compliance-check/check-biome.mjs` — replaced by `biome-runner.mjs`
- `scripts/compliance-check/check-context-freshness.mjs` — moved to `checks/`
- `scripts/compliance-check/check-context-governance.mjs` — moved to `checks/`
- `scripts/compliance-check/check-changelogs.mjs` — moved to `checks/`
- `scripts/compliance-check/check-version-status.mjs` — moved to `checks/`
- `scripts/compliance-check/check-symbol-uniqueness.mjs` — moved to `checks/`

### Hooks — Modified (2 files)

**`.clinerules/hooks/PostToolUse.mjs`**
- Complete rewrite
- Imports `loadRules`, `checkFile` from `scripts/compliance-check/rule-engine.mjs`
- Imports `checkFile` from `scripts/compliance-check/biome-runner.mjs`
- Flow:
  1. Parse hook input, extract file path from tool parameters
  2. Skip if not a structural tool (write_to_file, replace_in_file) or not a source file
  3. Read modified file content
  4. Load all rules via `loadRules(workspaceRoot)`
  5. Run `checkFile(filePath, content, rules)` — get violations
  6. Run `checkFileBiome(filePath)` — get biome violations for single file
  7. Run context regeneration (keep existing `--incremental` behavior)
  8. If any violations → `emitBlock(formattedErrorMessage)`
  9. If clean → `emitAllow()`

**`.clinerules/hooks/TaskComplete.mjs`**
- Complete rewrite
- Imports rule-engine, biome-runner, project health checks, auto-changeset
- Flow:
  1. Run `pnpm build` (without prebuild/postbuild lifecycle hooks)
  2. Load all rules via `loadRules(workspaceRoot)`
  3. Run `checkProject(workspaceRoot, rules)` — all source files
  4. Run `checkProjectBiome(workspaceRoot)` — full biome check
  5. Run project health checks (context freshness, governance, changelogs, version status, symbol uniqueness)
  6. Run changeset compliance (existing logic)
  7. Run typecheck (existing logic)
  8. If any violations → `emitBlock(formattedErrorMessage)`
  9. If clean → `emitAllow()`

### Hooks — Unchanged (3 files)

- `.clinerules/hooks/hook-io.mjs` — shared I/O utilities, no changes needed
- `.clinerules/hooks/PostToolUse.ps1` — thin PowerShell wrapper, unchanged
- `.clinerules/hooks/TaskComplete.ps1` — thin PowerShell wrapper, unchanged

### Config — Modified (2 files)

**`biome.json`**
- Change all `warn` levels to `error`:
  - `complexity.useSimplifiedLogicExpression`: `"warn"` → `"error"`
  - `correctness.noUnusedFunctionParameters`: `"warn"` → `"error"`
  - `correctness.useExhaustiveDependencies`: `"warn"` → `"error"`
  - `performance.noAccumulatingSpread`: `"warn"` → `"error"`
  - `style.noImplicitBoolean`: `"warn"` → `"error"`
  - `style.noNegationElse`: `"warn"` → `"error"`
  - `style.noShoutyConstants`: `"warn"` → `"error"`
  - `style.noUselessElse`: `"warn"` → `"error"`
  - `suspicious.noConsole`: `"warn"` → `"error"` (scripts override already exists)
  - `suspicious.noExplicitAny`: `"warn"` → `"error"`

**`package.json`**
- Remove `"prebuild"` script (was `"node scripts/generate-ai-context/index.mjs"`)
- Remove `"postbuild"` script (was `"node scripts/compliance-check/index.mjs"`)
- Keep `"generate-context"`, `"generate-context:force"`, `"generate-context:check"` scripts
- Keep `"compliance"` script (updated to use new structure)
- Keep `"preflight"` script unchanged

### Documentation — Modified (1 file)

**`.clinerules/HOOKS_REFERENCE.md`**
- Update to reflect new hook architecture
- Document the unified `checks[]` schema
- Document the suppression comment model
- Document the PostToolUse per-file validation flow
- Document the TaskComplete full-project validation flow
- Update the field reference table

[Functions]

### New Functions

**`loadRules(workspaceRoot: string): RuleCheck[]`** — `scripts/compliance-check/rule-engine.mjs`
- Reads all `workspace-*.json` files from `.clinerules/`
- Extracts and flattens all `checks[]` arrays
- Returns unified array of RuleCheck objects
- Caches result for process lifetime (rules don't change during a hook invocation)

**`matchesScope(filePath: string, scope: string): boolean`** — `scripts/compliance-check/rule-engine.mjs`
- Converts glob-like scope pattern to regex
- Normalizes path separators
- Returns true if filePath matches the scope pattern

**`matchesFileExtension(filePath: string, fileMatch: string[]): boolean`** — `scripts/compliance-check/rule-engine.mjs`
- Extracts file extension (without dot)
- Returns true if extension is in fileMatch array

**`checkFile(filePath: string, content: string, rules: RuleCheck[]): Violation[]`** — `scripts/compliance-check/rule-engine.mjs`
- Filters rules by scope + fileMatch
- Runs line-by-line pattern matching
- Checks for suppression comments on same line or line above
- Returns array of Violation objects

**`checkProject(workspaceRoot: string, rules: RuleCheck[]): Violation[]`** — `scripts/compliance-check/rule-engine.mjs`
- Walks SCAN_ROOTS directories
- Reads each source file
- Delegates to `checkFile` per file
- Returns aggregated violations

**`hasSuppression(line: string, prevLine: string, checkId: string): boolean`** — `scripts/compliance-check/rule-engine.mjs`
- Checks if `// compliance-ignore <checkId>:` appears on the line or previous line
- Returns true if suppressed

**`checkFileBiome(filePath: string): string[]`** — `scripts/compliance-check/biome-runner.mjs`
- Runs `npx biome check <filePath>`
- Parses output for errors
- Returns array of error strings

**`checkProjectBiome(workspaceRoot: string): string[]`** — `scripts/compliance-check/biome-runner.mjs`
- Runs `npx biome check .`
- Parses output for errors
- Returns array of error strings

### Modified Functions

**`main()` in `scripts/compliance-check/index.mjs`**
- Rewrite to use new module structure
- Load rules via `loadRules()`
- Run `checkProject()` instead of individual check functions
- Run `checkProjectBiome()` instead of `checkBiome()`
- Run project health checks from `checks/` subdirectory
- Format and report results

**PostToolUse main logic in `.clinerules/hooks/PostToolUse.mjs`**
- Replace context-regeneration-only logic with full validation pipeline
- Add rule-engine integration
- Add biome single-file check
- Change from always-allow to block-on-violation

**TaskComplete main logic in `.clinerules/hooks/TaskComplete.mjs`**
- Replace hardcoded check sequence with rule-engine integration
- Add full-project rule check
- Add biome full-project check
- Remove dependency on prebuild/postbuild lifecycle
- Keep build → changeset → typecheck sequence

### Removed Functions

**`checkBiome(collector)` in `scripts/compliance-check/check-biome.mjs`**
- Replaced by `biome-runner.mjs` module

**`loadTaskConfig(workspaceRoot)` in `.clinerules/hooks/TaskComplete.mjs`**
- Replaced by `loadRules()` from rule-engine (config is now in directives, hooks read rule files directly)

[Classes]

No new classes. The existing `SeverityCollector` class in `scripts/shared/output-helpers.mjs` is retained and used by the orchestrator scripts.

The Violation type is a plain object interface (not a class):

```typescript
interface Violation {
  id: string       // Check ID that triggered
  file: string     // Relative file path
  line: number     // Line number (1-based)
  message: string  // Human-readable violation message
  rationale: string // Why this rule exists
}
```

[Dependencies]

No new npm packages required. All functionality uses:
- Node.js built-ins (`fs`, `path`, `child_process`, `readline`)
- Existing dev dependencies (`@biomejs/biome`, `turbo`, `typescript`, `@changesets/cli`)

Version changes:
- None — all existing dependency versions are compatible

[Testing]

Testing strategy for this refactoring:

**Manual testing (primary approach):**

1. **PostToolUse — single file validation:**
   - Create a test file in `packages/core/src/` with an `unknown` type → verify hook blocks
   - Add suppression comment → verify hook allows
   - Create a file with bare comment → verify hook blocks
   - Modify a file outside source directories → verify hook skips
   - Run against a clean file → verify hook allows

2. **TaskComplete — full project validation:**
   - Run with clean codebase → verify build + compliance passes
   - Introduce a violation → verify TaskComplete blocks with clear error
   - Verify project health checks still work (version status, changelogs, etc.)

3. **Biome strict mode:**
   - Run `pnpm lint` after changing all warns to errors
   - Verify existing codebase passes (or fix any new violations)
   - This is the riskiest step — changing warns to errors may surface existing issues

4. **Rule engine — suppression model:**
   - Add `// compliance-ignore no-unknown-type: NOTE: valid reason` above a violation
   - Verify the check skips that violation
   - Verify other violations on same file are still caught

5. **Build lifecycle removal:**
   - Run `pnpm build` → verify no prebuild/postbuild scripts run
   - Verify `pnpm generate-context` still works independently
   - Verify `pnpm compliance` still works independently

**Edge cases to validate:**
- Empty file, file with only comments, file with no matching rules
- File outside all rule scopes (should skip cleanly)
- Rule file with no `checks` array (documentation-standards, versioning, workflows)
- Multiple violations in same file
- Suppression comment on wrong check-id (should not suppress)
- Biome output format variations (errors only, warnings only, both, clean)

[Implementation Order]

1. **Update biome.json** — Change all `warn` levels to `error`. Run `pnpm lint` to identify and fix any new violations in the existing codebase. This must come first since it establishes the baseline of what biome handles.

2. **Update package.json** — Remove `prebuild` and `postbuild` scripts. Run `pnpm build` to verify build still works without lifecycle hooks.

3. **Create `scripts/compliance-check/checks/` directory** — Create subdirectory and move the 5 project health check files (context-freshness, context-governance, changelogs, version-status, symbol-uniqueness) into it. Update their imports to account for the deeper nesting. Delete the old files from the parent directory.

4. **Create `scripts/compliance-check/biome-runner.mjs`** — Implement single-file and full-project biome check functions. Test with `node -e` to verify output parsing works correctly.

5. **Create `scripts/compliance-check/rule-engine.mjs`** — Implement rule loading, scope matching, file extension matching, line-by-line pattern checking, and suppression comment detection. This is the core new module.

6. **Rewrite all 6 workspace rule files** — Convert to v2 schema: merge `preToolUse` checks into unified `checks[]`, move process-level rules to `directives[]`, remove `enforcement`/`negativePattern`, remove `postToolUse`/`taskComplete` sections. Remove checks that biome now handles (e.g., `no-any-unknown` for `any` types). Keep `unknown` type check and all project-specific checks.

7. **Rewrite `scripts/compliance-check/index.mjs`** — Update to use new module structure (rule-engine, biome-runner, checks/*). Verify `pnpm compliance` runs correctly.

8. **Rewrite `.clinerules/hooks/PostToolUse.mjs`** — Implement per-file validation pipeline: load rules → check file → run biome on file → context regeneration → block or allow.

9. **Rewrite `.clinerules/hooks/TaskComplete.mjs`** — Implement full-project validation pipeline: build → rule check all files → biome full project → project health checks → changeset → typecheck → block or allow.

10. **Update `.clinerules/HOOKS_REFERENCE.md`** — Document new architecture, unified check schema, suppression model, hook flows.

11. **End-to-end validation** — Run full test sequence: modify a file (PostToolUse fires), complete a task (TaskComplete fires), verify `pnpm compliance` works, verify `pnpm build` works, verify `pnpm preflight` works.