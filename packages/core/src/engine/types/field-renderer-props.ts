import type { FieldSchema } from './field-schema'

export interface FieldRendererProps {
  schema: FieldSchema
  value: unknown
  onChange: (value: unknown) => void
  error?: string
}