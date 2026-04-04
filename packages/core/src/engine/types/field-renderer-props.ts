import type { FieldSchema } from './field-schema'

export interface FieldRendererProps {
  readonly schema: FieldSchema
  readonly value: unknown
  readonly onChange: (value: unknown) => void
  readonly error?: string
}