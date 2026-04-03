import type { FieldType } from './field-type'
import type { SelectOption } from './select-option'
import type { ValidationRule } from './validation-rule'
import type { FieldCondition } from './field-condition'
import type { FileUploadConfig } from './file-upload-config'

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