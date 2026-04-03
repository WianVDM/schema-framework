import { z } from 'zod'
import type { ZodIssue } from 'zod'
import {
  fieldTypeSchema,
  selectOptionSchema,
  validationRuleSchema,
  fieldConditionSchema,
  fileUploadConfigSchema,
} from './shared-schemas'
import type { ValidationResult } from './shared-schemas'

export const fieldSchemaValidator = z.object({
  name: z.string().min(1, 'Field name is required'),
  label: z.string().min(1, 'Field label is required'),
  type: fieldTypeSchema,
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
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
})

export function validateFieldSchema(data: unknown): ValidationResult {
  const result = fieldSchemaValidator.safeParse(data)
  if (result.success) {
    return { success: true, errors: [] }
  }
  return {
    success: false,
    errors: result.error.issues.map(
      (issue: ZodIssue) => `${issue.path.join('.')}: ${issue.message}`
    ),
  }
}