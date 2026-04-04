// Layer 2: Engine — Schema types, validators, context, and renderers

// Types (one-export-per-file via barrel)
export type {
  FieldType,
  FieldSchema,
  SelectOption,
  FormSchema,
  GridColumnSchema,
  GridSchema,
  PrimitiveComponents,
  FieldRendererProps,
  SchemaFormProps,
  SchemaGridProps,
  SelectionStore,
  FormSubmitHandler,
  FieldCondition,
  ValidationRule,
  RuntimeValidationRule,
  FileUploadConfig,
  PaginationConfig,
  ColumnFilterConfig,
  StatusConfig,
  ServerPaginationConfig,
  ThemeConfig,
  I18nConfig,
  CellValueRenderer,
  Brand,
  FieldId,
  DataKey,
  ReadonlyDeep,
  DeepFrozen,
  ConditionOperator,
  ValidationType,
} from './types'

// Validators (one-export-per-file via barrel)
export {
  fieldSchemaValidator,
  validateFieldSchema,
  formSchemaValidator,
  validateFormSchema,
  gridSchemaValidator,
  gridColumnSchemaValidator,
  validateGridSchema,
  validateFieldValue,
  evaluateCondition,
} from './validators'

export type { ValidationResult } from './validators'

// Context
export { PrimitivesProvider, usePrimitives } from './context/primitives-context'

// Helpers
export { resolveMessage } from './helpers/i18n'
export { deepFreeze, asDataKey } from './helpers'

// Renderers
export { SchemaForm } from './renderers/schema-form'
export { SchemaGrid } from './renderers/schema-grid'
export { FieldRenderer } from './renderers/field-renderer'
export { ThemeProvider, useTheme } from './renderers/theme-provider'
