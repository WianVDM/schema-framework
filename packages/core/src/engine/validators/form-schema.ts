import { z } from 'zod'
import type { ZodIssue } from 'zod'
import { fieldSchemaValidator } from './field-schema'
import type { ValidationResult } from './shared-schemas'

export const formSchemaValidator = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  fields: z
    .array(fieldSchemaValidator)
    .min(1, 'Form must have at least one field'),
  submitLabel: z.string().optional(),
  cancelLabel: z.string().optional(),
  layout: z.enum(['stack', 'grid']).optional(),
}).strict()

export function validateFormSchema(data: unknown): ValidationResult {
  const result = formSchemaValidator.safeParse(data)
  if (result.success) {
    return { success: true, errors: [] }
  }
  return {
    success: false,
    errors: result.error.issues.map(
      (issue: ZodIssue) => issue.path.length > 0
        ? `${issue.path.join('.')}: ${issue.message}`
        : issue.message
    ),
  }
}