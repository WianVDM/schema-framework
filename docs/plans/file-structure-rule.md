# Implementation Plan: File Structure & Context Map Rule

## [Overview]

Establish a strict one-export-per-file convention with graph-based context maps to give AI models full relationship awareness across a fragmented file structure.

This project uses a 3-layer architecture (Primitives, Engine, Composition) in a pnpm monorepo. To keep files surgically clean, every type, interface, class, and exported function must live in its own dedicated file. This fragmentation creates a context problem: when an AI model opens one file, it cannot see related files in other directories. The solution is a dual-layer context mapping system: per-directory `.context.md` files for local relationships and a centralized `docs/context-map.md` for the global graph. A Cline rule file enforces the convention, and a PostToolUse hook validates compliance after each file write.

## [Types]

No new TypeScript types are introduced. The rule operates entirely at the convention/documentation layer.

### Context Map Schema

Each `.context.md` file follows this structure:

```markdown
# [Directory Name] - Context Map

## File Inventory
| File | Export Name | Export Type | Description |
|------|-------------|-------------|-------------|
| filename.ts | ExportName | type/instance/function/component | Brief purpose |

## Relationships
- `source-file.ts` <-- relationship-type --> `target-file.ts`
  - Relationship types: uses-type, implements, validates, renders, re-exports, consumes

## External Dependencies
- `this-file.ts` --> imports from `../other-directory/` (Layer N)
```

### Relationship Type Vocabulary

| Type | Direction | Meaning |
|------|-----------|---------|
| uses-type | A --> B | A imports a type/interface from B |
| implements | A --> B | A implements an interface defined in B |
| validates | A --> B | A contains validation logic for B's schema |
| renders | A --> B | A renders UI based on B's data shape |
| re-exports | A --> B | A (barrel file) re-exports B |
| consumes | A --> B | A calls/uses B's exported function |

## [Files]

### New Files to Create

1. **`.clinerules/workspace-file-structure.md`** (already exists, empty)
   - Purpose: The self-contained Cline rule enforcing one-export-per-file and context map maintenance
   - No references to hooks, other rules, or project-specific scripts

2. **`docs/context-map.md`**
   - Purpose: Centralized global graph index of all cross-file relationships
   - Read by AI at task start for full project awareness

3. **`packages/core/src/engine/.context.md`**
   - Purpose: Local context map for engine layer files
   - Documents relationships between schemas, validators, renderers, and types

4. **`packages/core/src/primitives/.context.md`**
   - Purpose: Local context map for primitives layer files
   - Documents relationships between UI wrapper components

5. **`apps/showcase/src/.context.md`**
   - Purpose: Local context map for showcase app files
   - Documents relationships between routes, pages, and core imports

### Existing Files to Modify

6. **`.clinerules/hooks/PostToolUse.ps1`**
   - Add a new handler `Invoke-FileStructureEnforcer` for `write_to_file` and `replace_in_file` tools
   - After editing `.ts`/`.tsx` files (excluding `index.ts`, config, test files), check for multiple named exports
   - Return `contextModification` warning if violation detected

## [Functions]

### New Functions

1. **`Invoke-FileStructureEnforcer`** in `.clinerules/hooks/PostToolUse.ps1`
   - Signature: `param($ToolInput)` returns `string`
   - Purpose: Check if a written `.ts`/`.tsx` file contains multiple named exports
   - Logic:
     - Extract file path from `$ToolInput.path`
     - Skip if not `.ts`/`.tsx`, or if `index.ts`, or if test file (`*.test.*`, `*.spec.*`)
     - Read file content (for `write_to_file`) or diff content (for `replace_in_file`)
     - Count `export ` declarations (excluding `export default`, `export type`, re-exports)
     - If count > 1, return warning message
   - Returns: Warning string or empty string

### Modified Functions

2. **Handler registration** in `.clinerules/hooks/PostToolUse.ps1`
   - Current: `$handlers = @{ "create_directory" = ${function:Invoke-ReadmeEnforcer} }`
   - New: Add `"write_to_file"` and `"replace_in_file"` entries pointing to `Invoke-FileStructureEnforcer`

## [Classes]

No new classes. All changes are at the function/file level.

## [Dependencies]

No new npm packages or external dependencies required. This is purely a convention and documentation layer.

## [Testing]

### Validation Strategy

1. **Rule file syntax**: Verify `.clinerules/workspace-file-structure.md` is valid Markdown that Cline can parse
2. **Context map format**: Ensure `.context.md` files follow the defined schema
3. **Hook syntax**: Run PowerShell parser validation on modified `PostToolUse.ps1`
4. **Integration test**: Write a test `.ts` file with multiple exports, verify hook detects it

### Manual Verification

- Confirm `.clinerules/workspace-file-structure.md` appears in Cline's Rules panel
- Confirm `.context.md` files are readable and follow the schema
- Confirm PostToolUse hook fires on `write_to_file` operations

## [Implementation Order]

1. Write content to `.clinerules/workspace-file-structure.md` - the core rule file
2. Create `docs/context-map.md` - the centralized global graph
3. Create `packages/core/src/engine/.context.md` - engine layer context
4. Create `packages/core/src/primitives/.context.md` - primitives layer context
5. Create `apps/showcase/src/.context.md` - showcase app context
6. Update `.clinerules/hooks/PostToolUse.ps1` - add one-export-per-file enforcement
7. Validate hook syntax with PowerShell parser