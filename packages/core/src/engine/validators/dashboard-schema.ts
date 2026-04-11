import { z } from 'zod'
import type { ZodIssue } from 'zod'
import { layoutSchemaValidator } from './layout-schema'
import { i18nConfigSchema } from './shared-schemas'
import type { ValidationResult } from './shared-schemas'

export const dashboardSchemaValidator = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  layout: layoutSchemaValidator,
  className: z.string().optional(),
  i18n: i18nConfigSchema.optional(),
}).strict()

export function validateDashboardSchema(data: unknown): ValidationResult {
  const result = dashboardSchemaValidator.safeParse(data)
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