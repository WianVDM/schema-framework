import { z } from 'zod'
import type { ZodIssue } from 'zod'
import { contentSchemaValidator } from './content-schema'
import { i18nConfigSchema } from './shared-schemas'
import type { ValidationResult } from './shared-schemas'

const tabItemValidator = z.object({
  id: z.string().min(1, 'Tab item must have a non-empty id'),
  label: z.string().min(1, 'Tab item must have a non-empty label'),
  icon: z.string().optional(),
  disabled: z.boolean().optional(),
  content: contentSchemaValidator,
  className: z.string().optional(),
}).strict()

export const tabSchemaValidator = z.object({
  tabs: z
    .array(tabItemValidator)
    .min(1, 'TabSchema must have at least one tab'),
  defaultTab: z.string().optional(),
  lazy: z.boolean().optional(),
  className: z.string().optional(),
  i18n: i18nConfigSchema.optional(),
}).strict()

export function validateTabSchema(data: unknown): ValidationResult {
  const result = tabSchemaValidator.safeParse(data)
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