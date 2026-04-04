import type { FieldSchema } from './field-schema'
import type { I18nConfig } from './i18n-config'

export interface FormSchema {
  readonly title?: string
  readonly description?: string
  readonly fields: readonly FieldSchema[]
  readonly submitLabel?: string
  readonly cancelLabel?: string
  readonly layout?: 'stack' | 'grid'
  readonly i18n?: I18nConfig
}