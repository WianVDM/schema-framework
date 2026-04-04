# Implementation Plan

## [Overview]

Fix all verified CodeRabbit review findings across 4 files: address-input.tsx, file-upload.tsx, field-renderer.tsx, and schema-grid.tsx.

This plan addresses accessibility issues (redundant ARIA attributes, missing `role="alert"`, keyboard-inaccessible drop zone), a label/htmlFor mismatch, className merging, status lookup case-sensitivity, and structured placeholder support. Each finding has been verified against the current codebase and confirmed as a legitimate issue.

## [Types]

### New type: `AddressPlaceholders`

Added in `packages/core/src/primitives/address-input.tsx`:

```typescript
export interface AddressPlaceholders {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}
```

### Modified type: `AddressInputProps`

The `placeholder` prop changes from `string` to `string | AddressPlaceholders`:

```typescript
interface AddressInputProps extends RestProps {
  value: AddressData
  onChange: (value: AddressData) => void
  disabled?: boolean
  id?: string
  placeholder?: string | AddressPlaceholders
}
```

## [Files]

### `packages/core/src/primitives/address-input.tsx` (MODIFY)

**Changes:**
1. Add `AddressPlaceholders` interface export
2. Change `placeholder` prop type from `string` to `string | AddressPlaceholders`
3. Add a helper function `resolvePlaceholder(field: keyof AddressData, placeholder?: string | AddressPlaceholders): string` that:
   - If `placeholder` is an object, returns `placeholder[field]` or falls back to default label (e.g., `'Street Address'`)
   - If `placeholder` is a string, uses existing concatenation pattern (`${placeholder} Street`)
   - If `undefined`, uses default label
4. Apply `{...rest}` only to the street (first) input
5. Remove `{...rest}` from city, state, zip, country inputs
6. Add explicit `aria-label` to city, state, zip, country inputs (e.g., `aria-label="City"`)

### `packages/core/src/primitives/file-upload.tsx` (MODIFY)

**Changes:**
1. Add `role="alert"` to the error `<p>` element (~line 128)
2. Merge `rest.className` with computed className for the drop zone div. Extract className computation into a variable and use template literal or string concatenation to include `rest.className`
3. Move `{...rest}` spread before className, then set `className={mergedClassName}` explicitly (so className from rest is preserved in the merge)
4. Add keyboard accessibility to drop zone div:
   - Add `role="button"`
   - Add `tabIndex={0}`
   - Add `onKeyDown` handler that triggers `inputRef.current?.click()` on Enter or Space key press (with `e.preventDefault()` for Space to prevent page scroll)

### `packages/core/src/engine/renderers/field-renderer.tsx` (MODIFY)

**Changes:**
1. In the `'address'` case, change the `Label`'s `htmlFor` from `fieldId` to `${fieldId}-street` (matching the first sub-input's id pattern)

### `packages/core/src/engine/renderers/schema-grid.tsx` (MODIFY)

**Changes:**
1. In `renderCellValue`, normalize status key: `const statusKey = String(value).toLowerCase()`
2. Add a dev-only warning after statusDef lookup:
   ```typescript
   if (process.env.NODE_ENV !== 'production' && col.type === 'status' && statusDef === undefined && value != null) {
     console.warn(`[SchemaGrid] No status variant found for key "${statusKey}". Available keys: ${Object.keys(col.statusConfig.variants).join(', ')}`)
   }
   ```

## [Functions]

### New function: `resolvePlaceholder`
- **File:** `packages/core/src/primitives/address-input.tsx`
- **Signature:** `function resolvePlaceholder(field: keyof AddressData, placeholder?: string | AddressPlaceholders): string`
- **Purpose:** Resolves the placeholder text for each address sub-field, supporting both string and structured object formats

### Modified function: `AddressInput`
- **File:** `packages/core/src/primitives/address-input.tsx`
- **Changes:** Destructure and handle `placeholder` as `string | AddressPlaceholders`, use `resolvePlaceholder` for each input, apply `{...rest}` only to street input

### Modified function: `renderCellValue`
- **File:** `packages/core/src/engine/renderers/schema-grid.tsx`
- **Changes:** Normalize `statusKey` with `.toLowerCase()`, add dev-only warning for undefined statusDef

## [Classes]

No class changes required.

## [Dependencies]

No new dependencies required. All changes use built-in React patterns and existing utilities.

## [Testing]

No automated tests exist in this project currently. Validation strategy:

1. Run `pnpm run build` to verify no TypeScript errors
2. Manual verification in the showcase dev server:
   - Address input: verify placeholders render correctly for both string and object forms
   - Address input: verify ARIA attributes only on street field
   - File upload: verify error messages have `role="alert"`
   - File upload: verify drop zone is keyboard-focusable and activatable
   - File upload: verify custom className is preserved
   - Schema grid: verify status badges render regardless of case

## [Implementation Order]

1. **`packages/core/src/primitives/address-input.tsx`** — Add `AddressPlaceholders` type, `resolvePlaceholder` helper, fix `{...rest}` spreading
2. **`packages/core/src/engine/renderers/field-renderer.tsx`** — Fix label `htmlFor` for address case
3. **`packages/core/src/primitives/file-upload.tsx`** — Add `role="alert"`, merge className, add keyboard accessibility
4. **`packages/core/src/engine/renderers/schema-grid.tsx`** — Normalize status lookup, add dev warning
5. **Build verification** — Run `pnpm run build` to confirm no TypeScript errors