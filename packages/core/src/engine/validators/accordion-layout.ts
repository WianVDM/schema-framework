import { z } from 'zod'
import type { LayoutSchema } from '../types/layout-schema'
import type { ValidationResult } from './shared-schemas'

/** Zod schema for accordion-specific configuration constraints */
const accordionConfigSchema = z
  .object({
    mode: z.enum(['single', 'multiple']).optional(),
    animation: z.enum(['slide', 'fade', 'none']).optional(),
    defaultOpen: z.array(z.string()).optional(),
    collapsible: z.boolean().optional(),
  })
  .strict()
  .optional()

/** Zod schema for accordion-specific layout constraints */
export const accordionLayoutSchema = z
  .object({
    type: z.literal('accordion'),
    regions: z.array(z.unknown()).min(1, 'Accordion layout requires at least one region'),
    accordionConfig: accordionConfigSchema,
  })
  .superRefine(validateAccordionConstraints)

/** Validates accordion-specific constraints */
function validateAccordionConstraints(
  data: { type: 'accordion'; regions: unknown[]; accordionConfig?: unknown },
  ctx: z.RefinementCtx,
): void {
  // NOTE: Each region must have a unique id for accordion items
  const ids = extractIds(data.regions)
  const seen = new Set<string>()
  for (const entry of ids) {
    if (seen.has(entry.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate region id "${entry.id}" at regions[${entry.index}]`,
        path: ['regions', entry.index, 'id'],
      })
    }
    seen.add(entry.id)
  }

  // NOTE: Validate defaultOpen references exist in regions
  if (
    data.accordionConfig &&
    typeof data.accordionConfig === 'object' &&
    data.accordionConfig !== null
  ) {
    const config = data.accordionConfig as { defaultOpen?: string[] }
    if (config.defaultOpen && Array.isArray(config.defaultOpen)) {
      const regionIds = new Set(ids.map(e => e.id))
      for (const openId of config.defaultOpen) {
        if (!regionIds.has(openId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `accordionConfig.defaultOpen "${openId}" does not match any region id`,
            path: ['accordionConfig', 'defaultOpen'],
          })
        }
      }
    }
  }
}

/** IdEntry paired with its original index */
interface IdEntry {
  readonly id: string
  readonly index: number
}

/** Extracts id values from region objects, preserving original indices */
function extractIds(regions: readonly unknown[]): IdEntry[] {
  const entries: IdEntry[] = []
  for (let i = 0; i < regions.length; i++) {
    const region = regions[i]
    if (typeof region === 'object' && region !== null && 'id' in region) {
      const id = (region as Record<string, unknown>).id
      if (typeof id === 'string') {
        entries.push({ id, index: i })
      }
    }
  }
  return entries
}

/** Runtime validation for accordion layout constraints */
export function validateAccordionLayout(schema: LayoutSchema): ValidationResult {
  if (schema.type !== 'accordion') {
    return { success: false, errors: ['Schema type must be "accordion"'] }
  }

  const errors: string[] = []

  // NOTE: Use extractIds to safely extract and validate region IDs
  const ids = extractIds(schema.regions)

  // NOTE: Check for duplicate region IDs
  const seen = new Set<string>()
  for (const entry of ids) {
    if (seen.has(entry.id)) {
      errors.push(`Duplicate region id "${entry.id}" at regions[${entry.index}]`)
    }
    seen.add(entry.id)
  }

  // NOTE: Validate defaultOpen references
  if (schema.accordionConfig?.defaultOpen) {
    const idSet = new Set(ids.map(e => e.id))
    for (const openId of schema.accordionConfig.defaultOpen) {
      if (!idSet.has(openId)) {
        errors.push(`accordionConfig.defaultOpen "${openId}" does not match any region id`)
      }
    }
  }

  return errors.length === 0 ? { success: true, errors: [] } : { success: false, errors }
}
