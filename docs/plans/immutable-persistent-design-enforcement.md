# Implementation Plan: Immutable & Persistent Design Pattern Enforcement

[Overview]
Enforce compile-time and runtime immutability across the entire schema framework codebase, eliminate type-unsafe patterns, and update project rules to mandate persistent design.

This plan addresses four categories of issues found during the architecture audit: (1) Rule and documentation updates to codify immutability as a project mandate, (2) new immutability infrastructure utilities (branded types, deep readonly, deep freeze), (3) hardening all existing types and validators to use immutable signatures, and (4) fixing type escape hatches and untyped data in the showcase app. The result is a codebase where schemas are deeply frozen at runtime and deeply readonly at compile time, no `any`/`unknown`/bare `string` patterns exist where typed alternatives are available, and all mock data is strongly typed.

[Types]

### New Utility Types

**`Brand<T, B>`** — `packages/core/src/engine/types/branded.ts`
```typescript
type Brand<T, B extends string> = T & { __brand: B }
type FieldId = Brand<string, 'FieldId'>
type DataKey = Brand<string, 'DataKey'>
```
Branded types wrap primitive strings to prevent accidental misuse. A `FieldId` cannot be passed where a `DataKey` is expected. UUIDs and GUIDs are fully compatible — they are still strings at runtime, just with an added compile-time tag.

**`ReadonlyDeep<T>`** — `packages/core/src/engine/types/readonly-deep.ts`
```typescript
type ReadonlyDeep<T> = T extends Function
  ? T
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<ReadonlyDeep<K>, ReadonlyDeep<V>>
  : T extends Set<infer U>
  ? ReadonlySet<ReadonlyDeep<U>>
  : T extends object
  ? { readonly [K in keyof T]: ReadonlyDeep<T[K]> }
  : T
```
Recursive readonly utility that makes every property at every depth `readonly`. Functions are preserved as-is (not made readonly). Used on all schema types to enforce compile-time immutability.

**`DeepFrozen<T>`** — `packages/core/src/engine/types/readonly-deep.ts`
```typescript
type DeepFrozen<T> = T extends Function
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepFrozen<T[K]> }
  : T
```
Runtime companion to `ReadonlyDeep`. This is the return type of `deepFreeze()`, providing a type-level guarantee that the object has been frozen.

### Existing Types Modified for Immutability

All schema types in `packages/core/src/engine/types/` will be updated:

- **`FieldType`** — No change (already a string literal union, which is immutable by nature)
- **`SelectOption`** — Wrapped with `Readonly<>`: `{ readonly label: string; readonly value: string }`
- **`ValidationRule`** — Wrapped with `Readonly<>`: `{ readonly type: ValidationType; readonly value?: string | number; readonly message: string }`
- **`FieldCondition`** — Wrapped with `ReadonlyDeep<>`: `{ readonly field: string; readonly operator: ConditionOperator; readonly value?: readonly (string | number)[] | string | number | boolean }`
- **`FileUploadConfig`** — Wrapped with `Readonly<>`: `{ readonly accept?: string; readonly maxSize?: number; readonly multiple?: boolean }`
- **`FieldSchema`** — Wrapped with `ReadonlyDeep<>`: all properties become deeply readonly
- **`I18nConfig`** — Wrapped with `Readonly<>`: `{ readonly locale: string; readonly messages?: Readonly<Record<string, string>> }`
- **`FormSchema`** — Wrapped with `ReadonlyDeep<>`: all properties deeply readonly
- **`PaginationConfig`** — Wrapped with `Readonly<>`
- **`ColumnFilterConfig`** — Wrapped with `Readonly<>`
- **`StatusConfig`** / **`StatusVariant`** — Wrapped with `ReadonlyDeep<>`
- **`GridColumnSchema`** — Wrapped with `ReadonlyDeep<>`
- **`ServerPaginationConfig`** — Wrapped with `Readonly<>`
- **`ThemeConfig`** — Wrapped with `ReadonlyDeep<>`
- **`GridSchema`** — Wrapped with `ReadonlyDeep<>`
- **`PrimitiveComponents`** — Properties remain as-is (React components are already effectively immutable), but the interface will use `Readonly<>` for non-component fields if any are added
- **`SelectionStore`** — `selectedData` becomes `Readonly<T> | null`
- **`FormSubmitHandler`** — `values` parameter becomes `Readonly<Record<string, unknown>>`
- **`SchemaFormProps`** — `schema` becomes `ReadonlyDeep<FormSchema>`
- **`SchemaGridProps`** — `schema` becomes `ReadonlyDeep<GridSchema>`, `data` becomes `readonly Record<string, unknown>[]`
- **`FieldRendererProps`** — `field` becomes `ReadonlyDeep<FieldSchema>`
- **`CellValueRenderer`** — `value` type unchanged (it's already `unknown`, which is appropriate for a cell value renderer)

### New Enum-like Union Types

**`ConditionOperator`** — extracted from inline usage:
```typescript
type ConditionOperator = 'equals' | 'notEquals' | 'in' | 'notIn' | 'truthy' | 'falsy'
```

**`ValidationType`** — extracted from inline usage:
```typescript
type ValidationType = 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom'
```

### Showcase Typed Data Interfaces

**`UserRow`** — `apps/showcase/src/data/user-row.ts`
```typescript
interface UserRow {
  readonly id: number
  readonly name: string
  readonly email: string
  readonly role: string
  readonly active: boolean
}
```

**`OrderRow`** — `apps/showcase/src/data/order-row.ts`
```typescript
interface OrderRow {
  readonly orderId: number
  readonly customer: string
  readonly date: string
  readonly total: number
  readonly status: string
}
```

[Files]

## New Files to Create

### Immutability Utilities
- `packages/core/src/engine/types/branded.ts` — `Brand<T, B>` utility, `FieldId`, `DataKey` branded types
- `packages/core/src/engine/types/readonly-deep.ts` — `ReadonlyDeep<T>` and `DeepFrozen<T>` recursive utility types
- `packages/core/src/engine/helpers/deep-freeze.ts` — `deepFreeze<T>(obj: T): DeepFrozen<T>` runtime utility that recursively freezes all nested objects and arrays

### Extracted Union Types
- `packages/core/src/engine/types/condition-operator.ts` — `ConditionOperator` union type
- `packages/core/src/engine/types/validation-type.ts` — `ValidationType` union type

### Showcase Typed Data
- `apps/showcase/src/data/user-row.ts` — `UserRow` interface
- `apps/showcase/src/data/order-row.ts` — `OrderRow` interface

## Files to Modify

### Rules & Documentation
- `.clinerules/workspace-rules.md` — Add Section 7: "Immutability & Persistent Design" mandate
- `ARCHITECTURE.md` — Add Section 7: "Immutability Strategy" documenting the pattern
- `docs/implementation-status.md` — Add Phase 5 tracking section

### Schema Types (ReadonlyDeep wrapping)
- `packages/core/src/engine/types/select-option.ts` — Wrap with `Readonly<>`
- `packages/core/src/engine/types/validation-rule.ts` — Use `ValidationType`, wrap with `Readonly<>`
- `packages/core/src/engine/types/field-condition.ts` — Use `ConditionOperator`, wrap with `ReadonlyDeep<>`
- `packages/core/src/engine/types/file-upload-config.ts` — Wrap with `Readonly<>`
- `packages/core/src/engine/types/field-schema.ts` — Wrap with `ReadonlyDeep<>`
- `packages/core/src/engine/types/i18n-config.ts` — Wrap with `Readonly<>`
- `packages/core/src/engine/types/form-schema.ts` — Wrap with `ReadonlyDeep<>`
- `packages/core/src/engine/types/pagination-config.ts` — Wrap with `Readonly<>`
- `packages/core/src/engine/types/column-filter-config.ts` — Wrap with `Readonly<>`
- `packages/core/src/engine/types/status-config.ts` — Wrap with `ReadonlyDeep<>`
- `packages/core/src/engine/types/grid-column-schema.ts` — Wrap with `ReadonlyDeep<>`
- `packages/core/src/engine/types/server-pagination-config.ts` — Wrap with `Readonly<>`
- `packages/core/src/engine/types/theme-config.ts` — Wrap with `ReadonlyDeep<>`
- `packages/core/src/engine/types/grid-schema.ts` — Wrap with `ReadonlyDeep<>`
- `packages/core/src/engine/types/primitive-components.ts` — Keep component types as-is (React components)
- `packages/core/src/engine/types/selection-store.ts` — `selectedData` becomes `Readonly<T> | null`
- `packages/core/src/engine/types/form-submit-handler.ts` — `values` becomes `Readonly<Record<string, unknown>>`
- `packages/core/src/engine/types/field-renderer-props.ts` — `field` becomes `ReadonlyDeep<FieldSchema>`
- `packages/core/src/engine/types/schema-form-props.ts` — `schema` becomes `ReadonlyDeep<FormSchema>`
- `packages/core/src/engine/types/schema-grid-props.ts` — `schema` becomes `ReadonlyDeep<GridSchema>`, `data` becomes `readonly Record<string, unknown>[]`
- `packages/core/src/engine/types/cell-value-renderer.ts` — No change needed
- `packages/core/src/engine/types/index.ts` — Add re-exports for new types (`Brand`, `FieldId`, `DataKey`, `ReadonlyDeep`, `DeepFrozen`, `ConditionOperator`, `ValidationType`)

### Helpers
- `packages/core/src/engine/helpers/index.ts` — Create barrel for helpers, add `deepFreeze` re-export

### Renderers (update imports to use new types)
- `packages/core/src/engine/renderers/field-renderer.tsx` — Use `ReadonlyDeep<FieldSchema>` in props
- `packages/core/src/engine/renderers/schema-form.tsx` — Use `ReadonlyDeep<FormSchema>`, update form values typing
- `packages/core/src/engine/renderers/schema-grid.tsx` — Use `ReadonlyDeep<GridSchema>`, `readonly Record<string, unknown>[]`
- `packages/core/src/engine/renderers/grid-pagination.tsx` — Use `Readonly<PaginationConfig>` or `ReadonlyDeep<GridSchema>`
- `packages/core/src/engine/renderers/grid-column-header.tsx` — Use `ReadonlyDeep<GridColumnSchema>`
- `packages/core/src/engine/renderers/grid-toolbar.tsx` — Use `ReadonlyDeep<GridSchema>`

### Context
- `packages/core/src/engine/context/primitives-context.tsx` — Fix `PrimitiveComponents` to align `FileUpload` and `AddressInput` prop types, removing the need for `as unknown as`

### Validators (use typed parameters instead of loose types)
- `packages/core/src/engine/validators/evaluate-condition.ts` — Use `FieldCondition` typed parameter instead of `{ field: string; operator: string; value?: unknown }`
- `packages/core/src/engine/validators/field-value.ts` — Use `ValidationRule[]` typed parameter instead of `{ type: string; value?: string | number; message: string }[]`

### Engine Barrel
- `packages/core/src/engine/index.ts` — Add exports for `deepFreeze` from helpers

### Core Public API
- `packages/core/src/index.ts` — Ensure `deepFreeze`, `ReadonlyDeep`, branded types are exported

### Showcase
- `apps/showcase/src/data/mock-schemas.ts` — Apply `deepFreeze()` to all mock schemas, use typed `UserRow[]` / `OrderRow[]` for data, apply `as const satisfies` pattern
- `apps/showcase/src/data/primitive-mappings.tsx` — Remove all `as unknown as` casts (type alignment fixed in `PrimitiveComponents`)
- `apps/showcase/src/server/schemas.ts` — No change needed (schemas are already frozen before passing to server functions)
- `apps/showcase/src/server/data.ts` — Update to use typed data interfaces
- `apps/showcase/src/routes/demo-grid.tsx` — Use typed `UserRow` instead of `Record<string, unknown>`
- `apps/showcase/src/routes/demo-orders.tsx` — Use typed `OrderRow` instead of `Record<string, unknown>`

### Context Maps
- `packages/core/src/engine/types/.context.md` — Add new type files
- `packages/core/src/engine/validators/.context.md` — Update relationship descriptions for typed parameters
- `docs/context-map.md` — Add immutability infrastructure to the map

## Files to Delete
None.

[Functions]

### New Functions

**`deepFreeze<T>(obj: T): DeepFrozen<T>`** — `packages/core/src/engine/helpers/deep-freeze.ts`
Recursively freezes an object and all nested objects/arrays using `Object.freeze()`. Returns the same reference with a `DeepFrozen<T>` type. Handles arrays, plain objects, and skips functions. This is the runtime enforcement companion to the compile-time `ReadonlyDeep<T>` type.

### Modified Functions

**`evaluateCondition(condition, formValues)`** — `packages/core/src/engine/validators/evaluate-condition.ts`
- Current signature: `(condition: { field: string; operator: string; value?: unknown }, formValues: Record<string, unknown>)`
- New signature: `(condition: Readonly<FieldCondition>, formValues: Readonly<Record<string, unknown>>) => boolean`
- Uses `ConditionOperator` in the switch instead of bare `string`

**`validateFieldValue(_value, field)`** — `packages/core/src/engine/validators/field-value.ts`
- Current signature: `(_value: unknown, field: { required?: boolean; validation?: { type: string; value?: string | number; message: string }[] })`
- New signature: `(_value: unknown, field: { required?: boolean; validation?: readonly ValidationRule[] }) => string | null`
- Uses `ValidationRule` type with `ValidationType` discriminated union instead of `type: string`

**`resolveMessage(key, i18n, fallback)`** — `packages/core/src/engine/helpers/i18n.ts`
- Current signature: `(key: string, i18n: I18nConfig | undefined, fallback: string)`
- New signature: `(key: string, i18n: Readonly<I18nConfig> | undefined, fallback: string) => string`

### Removed Functions
None.

[Classes]
No classes are affected. This project uses functional components, type aliases, and utility functions. No class modifications needed.

[Dependencies]
No new npm packages are required. All immutability utilities are implemented using TypeScript's type system and JavaScript's built-in `Object.freeze()`.

The only consideration is that `ReadonlyDeep<T>` replaces the need for a third-party library like `type-fest` or `ts-essentials`. We own the utility type, which keeps the dependency footprint at zero.

[Testing]
1. Run `pnpm build` from root after each major step to verify TypeScript compilation with all readonly types
2. Run `pnpm typecheck` to verify no type errors introduced by `ReadonlyDeep` wrapping
3. Manually verify that attempting to mutate a frozen schema at runtime throws a `TypeError` in strict mode
4. Verify that branded types prevent accidental ID misuse at compile time (e.g., passing `orderId` where `dataKey` expected should fail compilation)
5. Verify `as unknown as` casts are removed from `primitive-mappings.tsx` and all types align correctly
6. Verify mock data arrays are typed (not `Record<string, unknown>[]`) and frozen at runtime

[Implementation Order]

1. **Create new type files:** `branded.ts`, `readonly-deep.ts`, `condition-operator.ts`, `validation-type.ts` in `types/`
2. **Update `types/index.ts`:** Add re-exports for all new types
3. **Apply `Readonly<>` / `ReadonlyDeep<>` to all 15+ schema type files** (select-option through schema-grid-props)
4. **Create `deepFreeze()` helper** in `helpers/deep-freeze.ts` with barrel export
5. **Update `evaluateCondition` and `validateFieldValue`** to use typed parameters
6. **Fix `PrimitiveComponents` interface** to align FileUpload/AddressInput signatures
7. **Update all renderers** to accept readonly-typed props
8. **Create showcase data interfaces** (`UserRow`, `OrderRow`)
9. **Update `mock-schemas.ts`** with `deepFreeze()` and typed data arrays
10. **Remove `as unknown as` from `primitive-mappings.tsx`**
11. **Update showcase routes** to use typed data
12. **Update `engine/index.ts` and `index.ts` barrel exports** for new helpers and types
13. **Add Section 7 to `.clinerules/workspace-rules.md`** — Immutability mandate
14. **Update `ARCHITECTURE.md`** — Add immutability strategy section
15. **Update `docs/implementation-status.md`** — Add Phase 5 tracking
16. **Update `.context.md` files and `docs/context-map.md`**
17. **Run `pnpm build`** — Final verification