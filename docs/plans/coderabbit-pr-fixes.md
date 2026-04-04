# Implementation Plan

[Overview]
Fix 21 verified CodeRabbit PR review findings across documentation, type safety, runtime correctness, and immutability enforcement.

This plan addresses inline comments and nitpicks from the CodeRabbit review on the current branch. The findings span four categories: (1) documentation fixes in `.clinerules/`, `ARCHITECTURE.md`, `docs/context-map.md`, and `.context.md` files; (2) type safety improvements including branded types, exhaustive switch checks, and the ValidationRule serializable/runtime split; (3) runtime bug fixes for `deepFreeze` cycle detection, `evaluateCondition` default branch, `field-value` truthy guard, `form-schema` root-level error formatting, and strict Zod validators; (4) immutability enforcement on `SelectionStore` and `DeepFrozen` Map/Set support. No new dependencies are introduced. No structural/architectural changes are made — all fixes are localized to existing files.

[Types]

### Modified Type: `DeepFrozen<T>` (in `packages/core/src/engine/types/readonly-deep.ts`)

Add Map/Set branches to match what `ReadonlyDeep<T>` already has:

```typescript
export type DeepFrozen<T> = T extends Function
  ? T
  : T extends Map<infer K, infer V>
    ? ReadonlyMap<DeepFrozen<K>, DeepFrozen<V>>
    : T extends Set<infer U>
      ? ReadonlySet<DeepFrozen<U>>
      : T extends object
        ? { readonly [K in keyof T]: DeepFrozen<T[K]> }
        : T
```

### New Type: `RuntimeValidationRule` (in `packages/core/src/engine/types/runtime-validation-rule.ts`)

Extends the serializable `ValidationRule` with an optional `validate` callback for client-side use:

```typescript
import type { ValidationRule } from './validation-rule'

export interface RuntimeValidationRule extends ValidationRule {
  readonly validate?: (value: unknown) => string | null
}
```

### Modified Type: `ValidationRule` (in `packages/core/src/engine/types/validation-rule.ts`)

Remove the `validate` property so `ValidationRule` is fully serializable:

```typescript
import type { ValidationType } from './validation-type'

export interface ValidationRule {
  readonly type: ValidationType
  readonly value?: string | number
  readonly message: string
}
```

### Modified Type: `FieldSchema` (in `packages/core/src/engine/types/field-schema.ts`)

Change validation array to use `RuntimeValidationRule` for client-side form rendering:

```typescript
import type { RuntimeValidationRule } from './runtime-validation-rule'
// ...
readonly validation?: readonly RuntimeValidationRule[]
```

### Modified Type: `GridSchema` (in `packages/core/src/engine/types/grid-schema.ts`)

Use branded `DataKey` instead of `string`:

```typescript
import type { DataKey } from './branded'
// ...
readonly dataKey: DataKey
```

### Modified Type: `SelectionStore<T>` (in `packages/core/src/engine/types/selection-store.ts`)

Make state fields readonly:

```typescript
export interface SelectionStore<T = unknown> {
  readonly selectedId: string | null
  readonly selectedData: Readonly<T> | null
  setSelected: (id: string, data: T) => void
  clearSelection: () => void
}
```

### Modified Type: `SerializableFieldSchema` (in `apps/showcase/src/server/schemas.ts`)

Preserve validation metadata but strip the `validate` function:

```typescript
import type { ValidationRule } from '@my-framework/core'

type ValidationRuleSerializable = ValidationRule  // Already serializable now (validate removed)

type SerializableFieldSchema = Omit<FieldSchema, 'validation'> & {
  readonly validation?: readonly ValidationRule[]
}

type SerializableFormSchema = Omit<FormSchema, 'fields'> & {
  readonly fields: readonly SerializableFieldSchema[]
}
```

[Files]

### Documentation Files (6 files)

1. **`.clinerules/workspace-file-structure.md`** — Modify
   - Line 124: Change `"bird's eye view"` to `"bird's-eye view"` (hyphenated compound modifier with typographic apostrophe)
   - Lines 101, 104, 200: Replace `-->` text-arrow notation in template examples with Mermaid diagram blocks or prose descriptions that conform to the "no text-arrow" rule

2. **`ARCHITECTURE.md`** — Modify
   - Line 75: Change `helpers/       # i18n helper` to `helpers/       # i18n helper, deepFreeze utility`
   - Lines 80-83: Insert `docs/decisions/   # ADRs and architectural decisions` entry in the monorepo tree
   - Lines 267-268: Update `ConditionOperator` to `'equals' | 'notEquals' | 'in' | 'notIn' | 'truthy' | 'falsy'` and `ValidationType` to include `'custom'`

3. **`docs/context-map.md`** — Modify
   - Lines 29-35: Reverse all Mermaid arrow directions so consumers point to providers (e.g., `validators -->|uses-type| types` instead of `types -->|uses-type| validators`)

4. **`packages/core/src/engine/validators/.context.md`** — Modify
   - Insert blank line between `## File Inventory` heading and the table (line 3-4)

### Core Engine Type Files (5 files)

5. **`packages/core/src/engine/types/readonly-deep.ts`** — Modify
   - Add Map/Set branches to `DeepFrozen<T>` type alias

6. **`packages/core/src/engine/types/validation-rule.ts`** — Modify
   - Remove `validate?: (value: unknown) => string | null` property

7. **`packages/core/src/engine/types/runtime-validation-rule.ts`** — NEW
   - Create file exporting `RuntimeValidationRule` extending `ValidationRule` with optional `validate`

8. **`packages/core/src/engine/types/field-schema.ts`** — Modify
   - Change import from `ValidationRule` to `RuntimeValidationRule`
   - Update `validation` property type to `readonly RuntimeValidationRule[]`

9. **`packages/core/src/engine/types/grid-schema.ts`** — Modify
   - Import `DataKey` from `./branded`
   - Change `dataKey: string` to `dataKey: DataKey`

10. **`packages/core/src/engine/types/selection-store.ts`** — Modify
    - Add `readonly` to `selectedId` and `selectedData`

11. **`packages/core/src/engine/types/index.ts`** — Modify
    - Add export for `RuntimeValidationRule`

### Core Engine Validator Files (5 files)

12. **`packages/core/src/engine/helpers/deep-freeze.ts`** — Modify
    - Add cycle detection using `WeakSet`
    - Add Map/Set freezing support to match `DeepFrozen<T>` type

13. **`packages/core/src/engine/validators/evaluate-condition.ts`** — Modify
    - Change default branch from `return true` to exhaustive check with `assertUnreachable` helper
    - Alternatively: return `false` (fail-closed) and add `const _exhaustiveCheck: never = operator`

14. **`packages/core/src/engine/validators/field-value.ts`** — Modify
    - Change `if (error) return error` to `if (error != null) return error`
    - Update import from `ValidationRule` to `RuntimeValidationRule`

15. **`packages/core/src/engine/validators/field-schema.ts`** — Modify
    - Add `.strict()` to `fieldSchemaValidator` Zod object

16. **`packages/core/src/engine/validators/form-schema.ts`** — Modify
    - Add `.strict()` to `formSchemaValidator` Zod object
    - Fix root-level error formatting: use `issue.path.join('.') || 'root'`

17. **`packages/core/src/engine/validators/grid-schema.ts`** — Modify
    - Add `.strict()` to both `gridColumnSchemaValidator` and `gridSchemaValidator`
    - Fix root-level error formatting (same pattern as form-schema)

### Core Engine Renderer Files (1 file)

18. **`packages/core/src/engine/renderers/schema-grid.tsx`** — Modify
    - Add inline comment above line 54 cast explaining intentional readonly-to-mutable conversion

### Core Engine Barrel Files (1 file)

19. **`packages/core/src/engine/index.ts`** — Modify
    - Add `useTheme` re-export from `./renderers/theme-provider`
    - Add `RuntimeValidationRule` to type exports

### Showcase App Files (1 file)

20. **`apps/showcase/src/server/schemas.ts`** — Modify
    - Update `SerializableFieldSchema` to preserve `validation` (minus `validate` function, which is now removed from `ValidationRule` anyway)
    - Simplify: Since `ValidationRule` is now serializable, `SerializableFieldSchema` just becomes `FieldSchema` directly (or the type alias can remain for documentation clarity)

### Shared Schemas (1 file)

21. **`packages/core/src/engine/validators/shared-schemas.ts`** — Modify
    - Change `locale: z.string()` to `locale: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid locale format')`

[Functions]

### Modified Functions

| Function | File | Change |
|----------|------|--------|
| `deepFreeze<T>` | `packages/core/src/engine/helpers/deep-freeze.ts` | Add WeakSet cycle detection + Map/Set freeze support |
| `evaluateCondition` | `packages/core/src/engine/validators/evaluate-condition.ts` | Replace default `return true` with exhaustive never check + `return false` |
| `validateFieldValue` | `packages/core/src/engine/validators/field-value.ts` | Change `if (error)` to `if (error != null)` on line 11 |
| `validateFieldSchema` | `packages/core/src/engine/validators/field-schema.ts` | Add `.strict()` to validator — no function change needed |
| `validateFormSchema` | `packages/core/src/engine/validators/form-schema.ts` | Add `.strict()` + fix root error path |
| `validateGridSchema` | `packages/core/src/engine/validators/grid-schema.ts` | Add `.strict()` + fix root error path |

### New Helper

A local `assertUnreachable` helper or inline never-check in `evaluate-condition.ts`:

```typescript
function assertUnreachable(value: never): never {
  throw new Error(`Unhandled condition operator: ${value}`)
}
```

[Classes]

No class modifications. All changes are at the type, function, and documentation level.

[Dependencies]

No dependency changes. All fixes use existing TypeScript, Zod, and standard library features.

[Testing]

### Validation Strategy

1. **TypeScript check:** `pnpm run typecheck` — must pass with zero errors
2. **Build check:** `pnpm run build` — both packages must build successfully
3. **Visual check:** `pnpm dev` — verify showcase app renders without runtime errors

### Key Risk Areas

- **ValidationRule split:** Removing `validate` from `ValidationRule` and adding `RuntimeValidationRule` must not break existing consumers. The `field-value.ts` and `field-schema.ts` imports need updating.
- **GridSchema.dataKey branded type:** The `DataKey` branded type change requires updating the grid-schema Zod validator to cast `z.string()` output to `DataKey`, and any consumer constructing `GridSchema` objects must wrap string values.
- **Strict Zod validators:** Any mock schemas with extra/typo keys will now fail validation. Need to verify mock data passes strict validation.

[Implementation Order]

1. **Documentation fixes** (no code risk, independent of code changes)
   - `.clinerules/workspace-file-structure.md` — hyphenation + text-arrow fix
   - `ARCHITECTURE.md` — tree entries + type union docs
   - `docs/context-map.md` — Mermaid arrow directions
   - `validators/.context.md` — blank line fix

2. **Type system changes** (foundation for subsequent code fixes)
   - `readonly-deep.ts` — DeepFrozen Map/Set branches
   - `validation-rule.ts` — Remove `validate`
   - Create `runtime-validation-rule.ts`
   - `field-schema.ts` — Use `RuntimeValidationRule`
   - `selection-store.ts` — Readonly state fields
   - `grid-schema.ts` — Branded `DataKey`
   - `types/index.ts` — Export `RuntimeValidationRule`

3. **Runtime fixes** (depend on type changes)
   - `deep-freeze.ts` — Cycle detection + Map/Set support
   - `evaluate-condition.ts` — Exhaustive check + fail-closed default
   - `field-value.ts` — Null-explicit guard + RuntimeValidationRule import
   - `field-schema.ts` (validator) — `.strict()`
   - `form-schema.ts` — `.strict()` + root error path
   - `grid-schema.ts` (validator) — `.strict()` + root error path + DataKey handling
   - `shared-schemas.ts` — Locale regex validation

4. **Renderer and barrel fixes**
   - `schema-grid.tsx` — Cast comment
   - `engine/index.ts` — Export `useTheme` + `RuntimeValidationRule`

5. **Showcase app fixes**
   - `schemas.ts` — Simplify SerializableFieldSchema now that ValidationRule is serializable

6. **Context map updates**
   - Update `.context.md` files affected by new file (`runtime-validation-rule.ts`)

7. **Validation**
   - Run `pnpm run typecheck`
   - Run `pnpm run build`