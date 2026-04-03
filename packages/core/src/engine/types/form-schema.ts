import type { FieldSchema } from './field-schema'
import type { I18nConfig } from './i18n-config'

export interface FormSchema {
  title?: string
  description?: string
  fields: FieldSchema[]
  submitLabel?: string
  cancelLabel?: string
  layout?: 'stack' | 'grid'
  i18n?: I18nConfig
}