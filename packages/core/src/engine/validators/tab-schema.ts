import { z } from 'zod'
import { contentSchemaValidator } from './content-schema'
import type { ValidationResult } from './shared-schemas'
import { formatZodIssue, i18nConfigSchema } from './shared-schemas'

const tabItemValidator = z
  .object({
    id: z.string().min(1, 'Tab item must have a non-empty id'),
    label: z.string().min(1, 'Tab item must have a non-empty label'),
    icon: z.string().optional(),
    disabled: z.boolean().optional(),
    content: contentSchemaValidator,
    className: z.string().optional(),
  })
  .strict()

export const tabSchemaValidator = z
  .object({
    tabs: z
      .array(tabItemValidator)
      .min(1, 'TabSchema must have at least one tab')
      .refine(tabs => new Set(tabs.map(t => t.id)).size === tabs.length, {
        message: 'Tab IDs must be unique within a TabSchema',
      }),
    defaultTab: z.string().optional(),
    mountMode: z.enum(['eager', 'lazy']).optional(),
    lazy: z.boolean().optional(),
    className: z.string().optional(),
    i18n: i18nConfigSchema.optional(),
  })
  .strict()
  .superRefine((schema, ctx) => {
    if (schema.defaultTab !== undefined && !schema.tabs.some(t => t.id === schema.defaultTab)) {
      ctx.addIssue({
        code: 'custom',
        path: ['defaultTab'],
        message: `defaultTab "${schema.defaultTab}" does not match any tab ID`,
      })
    }
  })

export function validateTabSchema(data: unknown): ValidationResult {
  const result = tabSchemaValidator.safeParse(data)
  if (result.success) {
    return { success: true, errors: [] }
  }
  return {
    success: false,
    errors: result.error.issues.map(formatZodIssue),
  }
}
