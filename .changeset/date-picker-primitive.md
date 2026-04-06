---
"@my-framework/core": minor
---

feat: add DatePicker primitive with date-fns + react-day-picker

- Add `DatePickerConfig` type with format, placeholder, minDate, maxDate options
- Add `datePickerConfigSchema` Zod validator
- Create self-contained `DatePicker` primitive in Layer 1 (date-fns + react-day-picker)
- Add `dateConfig` property to `FieldSchema` for schema-driven date constraints
- Add `DatePicker` to `PrimitiveComponents` and `PrimitivesContext` defaults
- Update field renderer `case 'date'` to render `DatePicker` via `PrimitivesContext`
- Extract `useTheme` hook to separate file (one-export-per-file rule)
- Extract `AddressData` and `AddressPlaceholders` to separate files
- Add `date-fns` and `react-day-picker` as peer dependencies