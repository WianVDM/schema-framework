import { z } from 'zod'
import {
  fieldTypeSchema,
  selectOptionSchema,
  validationRuleSchema,
  fieldConditionSchema,
  fileUploadConfigSchema,
  datePickerConfigSchema,
  multiSelectConfigSchema,
  formatZodIssue,
} from './shared-schemas'
import type { ValidationResult } from './shared-schemas'

export const fieldSchemaValidator = z.object({
  name: z.string().min(1, 'Field name is required'),
  label: z.string().min(1, 'Field label is required'),
  type: fieldTypeSchema,
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()]).optional(),
  disabled: z.boolean().optional(),
  options: z
    .union([z.array(z.string()), z.array(selectOptionSchema)])
    .optional(),
  validation: z.array(validationRuleSchema).optional(),
  colSpan: z.number().int().positive().optional(),
  description: z.string().optional(),
  visibleWhen: fieldConditionSchema.optional(),
  dependsOn: z.array(z.string()).optional(),
  fileConfig: fileUploadConfigSchema.optional(),
  dateConfig: datePickerConfigSchema.optional(),
  multiSelectConfig: multiSelectConfigSchema.optional(),
}).strict().refine(
  (data) => {
    if (data.type === 'multiselect') {
      return data.multiSelectConfig !== undefined && data.multiSelectConfig !== null
    }
    return true
  },
  {
    message: 'multiSelectConfig is required for multiselect type',
  },
)

export function validateFieldSchema(data: unknown): ValidationResult {
  const result = fieldSchemaValidator.safeParse(data)
  if (result.success) {
    return { success: true, errors: [] }
  }
  return {
    success: false,
    errors: result.error.issues.map(formatZodIssue),
  }
}