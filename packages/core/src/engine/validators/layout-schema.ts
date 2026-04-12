import { z } from 'zod'
import type { ZodIssue } from 'zod'
import { responsiveConfigValidator } from './responsive-config'
import { contentSchemaValidator } from './content-schema'
import { i18nConfigSchema } from './shared-schemas'
import type { ValidationResult } from './shared-schemas'

const layoutRegionValidator = z.object({
  id: z.string().min(1, 'Region must have a non-empty id'),
  position: z.string().min(1, 'Region must have a non-empty position'),
  title: z.string().optional(),
  size: z.union([z.string(), z.number()]).optional(),
  minSize: z.union([z.string(), z.number()]).optional(),
  maxSize: z.union([z.string(), z.number()]).optional(),
  collapsible: z.boolean().optional(),
  collapsed: z.boolean().optional(),
  scrollable: z.boolean().optional(),
  resizable: z.boolean().optional(),
  content: contentSchemaValidator,
  responsive: responsiveConfigValidator.optional(),
  className: z.string().optional(),
  i18n: i18nConfigSchema.optional(),
}).strict()

export const layoutSchemaValidator = z.object({
  type: z.enum(['border', 'accordion', 'card', 'hbox', 'vbox']),
  regions: z
    .array(layoutRegionValidator)
    .min(1, 'LayoutSchema must have at least one region'),
  gap: z.number().min(0).optional(),
  padding: z.union([
    z.number().min(0),
    z.tuple([z.number().min(0), z.number().min(0)]),
  ]).optional(),
  className: z.string().optional(),
  i18n: i18nConfigSchema.optional(),
}).strict()

export function validateLayoutSchema(data: unknown): ValidationResult {
  const result = layoutSchemaValidator.safeParse(data)
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