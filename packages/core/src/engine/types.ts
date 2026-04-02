import type { ComponentType, ReactNode } from 'react'

// NOTE: All schema types are defined here as the single source of truth
// for the data-driven UI engine. Renderers consume these types to produce forms/grids.

export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'date'
  | 'password'
  | 'file'
  | 'address'

export interface SelectOption {
  label: string
  value: string
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom'
  value?: string | number
  message: string
}

export interface FieldCondition {
  field: string
  operator: 'equals' | 'notEquals' | 'in' | 'notIn' | 'truthy' | 'falsy'
  value?: string | number | boolean | (string | number)[]
}

export interface FileUploadConfig {
  accept?: string
  maxSize?: number
  multiple?: boolean
}

export interface FieldSchema {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  defaultValue?: string | number | boolean | null
  disabled?: boolean
  options?: string[] | SelectOption[]
  validation?: ValidationRule[]
  colSpan?: number
  description?: string
  visibleWhen?: FieldCondition
  dependsOn?: string[]
  fileConfig?: FileUploadConfig
}

export interface I18nConfig {
  locale: string
  messages?: Record<string, string>
}

export interface FormSchema {
  title?: string
  description?: string
  fields: FieldSchema[]
  submitLabel?: string
  cancelLabel?: string
  layout?: 'stack' | 'grid'
  i18n?: I18nConfig
}

export interface PaginationConfig {
  pageSize: number
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
}

export interface ColumnFilterConfig {
  enabled: boolean
  placeholder?: string
}

export interface StatusConfig {
  variants: Record<string, { label: string; className: string }>
}

export interface GridColumnSchema {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'boolean' | 'status'
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  filterable?: boolean
  resizable?: boolean
  visible?: boolean
  filter?: ColumnFilterConfig
  statusConfig?: StatusConfig
}

export interface ServerPaginationConfig {
  totalRecords: number
  currentPage: number
}

export interface ThemeConfig {
  classes?: Partial<{
    grid: string
    gridRow: string
    gridCell: string
    gridHeader: string
    form: string
    formField: string
    submitButton: string
    cancelButton: string
    pagination: string
    toolbar: string
  }>
}

export interface GridSchema {
  title?: string
  description?: string
  columns: GridColumnSchema[]
  dataKey: string
  striped?: boolean
  bordered?: boolean
  hoverable?: boolean
  emptyMessage?: string
  pagination?: PaginationConfig | boolean
  serverPagination?: ServerPaginationConfig
  filterable?: boolean
  resizable?: boolean
  columnVisibility?: Record<string, boolean>
  i18n?: I18nConfig
}

// PrimitiveComponents — used by PrimitivesContext to inject UI components.
// The showcase app maps shadcn/ui components to this interface.
export interface PrimitiveComponents {
  Input: ComponentType<Record<string, unknown>>
  Select: ComponentType<Record<string, unknown>>
  SelectTrigger: ComponentType<Record<string, unknown>>
  SelectContent: ComponentType<Record<string, unknown>>
  SelectItem: ComponentType<Record<string, unknown>>
  SelectValue: ComponentType<Record<string, unknown>>
  Label: ComponentType<Record<string, unknown>>
  Textarea: ComponentType<Record<string, unknown>>
  Checkbox: ComponentType<Record<string, unknown>>
  Table: ComponentType<Record<string, unknown>>
  TableHeader: ComponentType<Record<string, unknown>>
  TableBody: ComponentType<Record<string, unknown>>
  TableRow: ComponentType<Record<string, unknown>>
  TableHead: ComponentType<Record<string, unknown>>
  TableCell: ComponentType<Record<string, unknown>>
  Button: ComponentType<Record<string, unknown>>
  Badge: ComponentType<Record<string, unknown>>
  Dialog: ComponentType<Record<string, unknown>>
  DialogContent: ComponentType<Record<string, unknown>>
  DialogTrigger: ComponentType<Record<string, unknown>>
  DropdownMenu: ComponentType<Record<string, unknown>>
  DropdownMenuTrigger: ComponentType<Record<string, unknown>>
  DropdownMenuContent: ComponentType<Record<string, unknown>>
  DropdownMenuItem: ComponentType<Record<string, unknown>>
  FileUpload: ComponentType<Record<string, unknown>>
  AddressInput: ComponentType<Record<string, unknown>>
}

export type FormSubmitHandler = (values: Record<string, unknown>) => void | Promise<void>

export interface SelectionStore<T = unknown> {
  selectedId: string | null
  selectedData: T | null
  setSelected: (id: string, data: T) => void
  clearSelection: () => void
}

// Renderer prop types
export interface FieldRendererProps {
  schema: FieldSchema
  value: unknown
  onChange: (value: unknown) => void
  error?: string
}

export interface SchemaFormProps {
  schema: FormSchema
  onSubmit: FormSubmitHandler
  initialValues?: Record<string, unknown>
  onCancel?: () => void
}

export interface SchemaGridProps {
  schema: GridSchema
  data: Record<string, unknown>[]
  onRowClick?: (row: Record<string, unknown>, rowIndex: number) => void
  onPageChange?: (page: number, pageSize: number) => void
}

// Helper type for formatted cell values
export type CellValueRenderer = (col: GridColumnSchema, value: unknown) => ReactNode
