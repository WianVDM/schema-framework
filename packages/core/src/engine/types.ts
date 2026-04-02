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

export interface SelectOption {
  label: string
  value: string
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom'
  value?: string | number
  message: string
}

export interface FieldSchema {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  defaultValue?: unknown
  disabled?: boolean
  options?: string[] | SelectOption[]
  validation?: ValidationRule[]
  colSpan?: number
  description?: string
}

export interface FormSchema {
  title?: string
  description?: string
  fields: FieldSchema[]
  submitLabel?: string
  layout?: 'stack' | 'grid'
}

export interface GridColumnSchema {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'boolean' | 'status'
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode
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
}

export interface SchemaGridProps {
  schema: GridSchema
  data: Record<string, unknown>[]
  onRowClick?: (row: Record<string, unknown>, rowIndex: number) => void
}