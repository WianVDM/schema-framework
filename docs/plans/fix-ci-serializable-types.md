# Implementation Plan

[Overview]
Fix 5 TypeScript errors in server functions that fail CI on the `refactor/architecture-doc-restructure-and-validator-fixes` branch.

The CI pipeline (`pnpm run typecheck`) fails because TanStack Start's `createServerFn` enforces serializable return types at compile time. Two server files in `apps/showcase/src/server/` have type mismatches: `data.ts` casts readonly frozen arrays to mutable types, and `schemas.ts` returns `FormSchema` which contains `ValidationRule.validate` — a function property that cannot cross the serialization boundary.

[Types]

### New Types (defined locally in `schemas.ts`)

```typescript
/** FieldSchema with the non-serializable `validation` property omitted. */
type SerializableFieldSchema = Omit<FieldSchema, 'validation'>

/** FormSchema using serializable field definitions (no function callbacks). */
type SerializableFormSchema = Omit<FormSchema, 'fields'> & {
  readonly fields: readonly SerializableFieldSchema[]
}
```

### Existing Types Involved (no changes)

| Type | File | Role |
|------|------|------|
| `ValidationRule` | `packages/core/src/engine/types/validation-rule.ts` | Contains `validate?: (value: unknown) => string \| null` — non-serializable |
| `FieldSchema` | `packages/core/src/engine/types/field-schema.ts` | Has `validation?: readonly ValidationRule[]` |
| `FormSchema` | `packages/core/src/engine/types/form-schema.ts` | Has `fields: readonly FieldSchema[]` |
| `GridSchema` | `packages/core/src/engine/types/grid-schema.ts` | No function properties — already serializable |
| `DeepFrozen<T>` | `packages/core/src/engine/types/readonly-deep.ts` | Makes all properties deeply readonly |
| `UserRow` | `apps/showcase/src/data/user-row.ts` | Readonly row interface |
| `OrderRow` | `apps/showcase/src/data/order-row.ts` | Readonly row interface |

[Files]

### File 1: `apps/showcase/src/server/data.ts` (modify)

**Current state:** 16 lines, 2 errors (TS2352 on lines 8 and 14)

**Changes:**
- Change `SerializableRecord[]` return type to `readonly SerializableRecord[]` in both handlers
- Remove the `as SerializableRecord[]` type assertions from both return statements
- The `mockUsers` and `mockOrders` values (typed as `DeepFrozen<readonly UserRow[]>` and `DeepFrozen<readonly OrderRow[]>`) structurally satisfy `readonly SerializableRecord[]` without assertion

**Before:**
```typescript
export const getUsers = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SerializableRecord[]> => {
    return mockUsers as SerializableRecord[]
  }
)
```

**After:**
```typescript
export const getUsers = createServerFn({ method: 'GET' }).handler(
  async (): Promise<readonly SerializableRecord[]> => {
    return mockUsers
  }
)
```

(Same pattern for `getOrders`.)

### File 2: `apps/showcase/src/server/schemas.ts` (modify)

**Current state:** 45 lines, 3 errors (TS2345 on lines 18, 36, 42)

**Changes:**
- Add `SerializableFieldSchema` and `SerializableFormSchema` type definitions after the imports
- Replace `type SerializableFormSchema = FormSchema` with the new proper serializable type
- Add explicit type annotations on the `JSON.parse()` return values in the 3 affected handlers (`getContactFormSchema`, `getRegistrationFormSchema`, `getSupportTicketFormSchema`)
- The 2 `GridSchema` handlers (`getUserGridSchema`, `getOrderGridSchema`) are unchanged — `GridSchema` has no function properties

**Before:**
```typescript
type SerializableFormSchema = FormSchema

export const getContactFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SerializableFormSchema> => {
    return JSON.parse(JSON.stringify(contactFormSchema))
  }
)
```

**After:**
```typescript
type SerializableFieldSchema = Omit<FieldSchema, 'validation'>

type SerializableFormSchema = Omit<FormSchema, 'fields'> & {
  readonly fields: readonly SerializableFieldSchema[]
}

export const getContactFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SerializableFormSchema> => {
    return JSON.parse(JSON.stringify(contactFormSchema)) as SerializableFormSchema
  }
)
```

(Same pattern for `getRegistrationFormSchema` and `getSupportTicketFormSchema`.)

[Functions]

### Modified Functions

| Function | File | Change |
|----------|------|--------|
| `getUsers` | `apps/showcase/src/server/data.ts` | Return type → `Promise<readonly SerializableRecord[]>`, remove `as` assertion |
| `getOrders` | `apps/showcase/src/server/data.ts` | Return type → `Promise<readonly SerializableRecord[]>`, remove `as` assertion |
| `getContactFormSchema` | `apps/showcase/src/server/schemas.ts` | Return type → `Promise<SerializableFormSchema>` (new type), add `as SerializableFormSchema` cast |
| `getRegistrationFormSchema` | `apps/showcase/src/server/schemas.ts` | Return type → `Promise<SerializableFormSchema>` (new type), add `as SerializableFormSchema` cast |
| `getSupportTicketFormSchema` | `apps/showcase/src/server/schemas.ts` | Return type → `Promise<SerializableFormSchema>` (new type), add `as SerializableFormSchema` cast |

No new functions or removed functions.

[Classes]

No class modifications. All changes are at the type and function level.

[Dependencies]

No dependency changes. This is a pure type-level fix using existing TypeScript features.

[Testing]

### Validation Strategy

1. **Local typecheck:** Run `pnpm run typecheck` — must pass with zero errors
2. **Local build:** Run `pnpm run build` — both packages must build successfully
3. **CI verification:** Push to the `refactor/architecture-doc-restructure-and-validator-fixes` branch and confirm the CI `build-and-typecheck` job passes

### Manual Verification Checklist
- [ ] `data.ts` — `mockUsers` return value is still runtime-identical (no data transformation)
- [ ] `data.ts` — `mockOrders` return value is still runtime-identical (no data transformation)
- [ ] `schemas.ts` — `JSON.parse(JSON.stringify(...))` still strips functions at runtime
- [ ] `schemas.ts` — Grid schema handlers are unchanged
- [ ] No `as unknown as` escape hatches introduced
- [ ] Immutability mandate maintained (all readonly types preserved)

[Implementation Order]

1. **Modify `apps/showcase/src/server/data.ts`** — Fix the readonly/mutable array mismatch (2 errors)
   - Change return types to `readonly SerializableRecord[]`
   - Remove `as SerializableRecord[]` assertions
2. **Modify `apps/showcase/src/server/schemas.ts`** — Fix the non-serializable function type mismatch (3 errors)
   - Define `SerializableFieldSchema` type (omit `validation` from `FieldSchema`)
   - Define `SerializableFormSchema` type (replace the current `type SerializableFormSchema = FormSchema`)
   - Update 3 handler return types and add `as SerializableFormSchema` casts
3. **Run `pnpm run typecheck`** — Verify zero TypeScript errors
4. **Run `pnpm run build`** — Verify both packages build successfully
5. **Commit and push** — Verify CI passes on the remote branch