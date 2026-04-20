import { z } from 'zod'
import type { LayoutSchema } from '../types/layout-schema'
import type { ValidationResult } from './shared-schemas'

/** Zod schema for single-mode accordion config */
const singleAccordionConfigSchema = z
  .object({
    mode: z.enum(['single']),
    animation: z.enum(['slide', 'fade', 'none']).optional(),
    defaultOpen: z.string().optional(),
    collapsible: z.boolean().optional(),
  })
  .strict()

/** Zod schema for multiple-mode accordion config */
const multipleAccordionConfigSchema = z
  .object({
    mode: z.literal('multiple'),
    animation: z.enum(['slide', 'fade', 'none']).optional(),
    defaultOpen: z.array(z.string()).optional(),
  })
  .strict()

/** Zod schema for accordion-specific configuration constraints — discriminated on mode */
const accordionConfigSchema = z
  .union([singleAccordionConfigSchema, multipleAccordionConfigSchema])
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

  // NOTE: Validate defaultOpen references exist in regions for both config variants
  validateDefaultOpenRefs(data.accordionConfig, ids, ctx)
}

/** Validates defaultOpen references against known region IDs for discriminated config */
function validateDefaultOpenRefs(
  accordionConfig: unknown,
  ids: IdEntry[],
  ctx: z.RefinementCtx,
): void {
  if (!accordionConfig || typeof accordionConfig !== 'object' || accordionConfig === null) return

  const config = accordionConfig as { mode?: string; defaultOpen?: unknown }
  const regionIds = new Set(ids.map(e => e.id))

  if (config.mode === 'multiple') {
    validateMultipleDefaultOpen(config.defaultOpen, regionIds, ctx)
  } else if (typeof config.defaultOpen === 'string') {
    validateSingleDefaultOpen(config.defaultOpen, regionIds, ctx)
  }
}

/** Validates multiple-mode defaultOpen array references */
function validateMultipleDefaultOpen(
  defaultOpen: unknown,
  regionIds: Set<string>,
  ctx: z.RefinementCtx,
): void {
  const openIds = Array.isArray(defaultOpen) ? defaultOpen : []
  for (const openId of openIds) {
    if (!regionIds.has(openId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `accordionConfig.defaultOpen "${openId}" does not match any region id`,
        path: ['accordionConfig', 'defaultOpen'],
      })
    }
  }
}

/** Validates single-mode defaultOpen string reference */
function validateSingleDefaultOpen(
  defaultOpen: string,
  regionIds: Set<string>,
  ctx: z.RefinementCtx,
): void {
  if (!regionIds.has(defaultOpen)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `accordionConfig.defaultOpen "${defaultOpen}" does not match any region id`,
      path: ['accordionConfig', 'defaultOpen'],
    })
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

  // NOTE: Validate defaultOpen references — handles discriminated union variants
  const config = schema.accordionConfig
  if (config?.defaultOpen) {
    const idSet = new Set(ids.map(e => e.id))
    if (config.mode === 'multiple') {
      for (const openId of config.defaultOpen as readonly string[]) {
        if (!idSet.has(openId)) {
          errors.push(`accordionConfig.defaultOpen "${openId}" does not match any region id`)
        }
      }
    } else {
      const openId = config.defaultOpen as unknown as string
      if (!idSet.has(openId)) {
        errors.push(`accordionConfig.defaultOpen "${openId}" does not match any region id`)
      }
    }
  }

  return errors.length === 0 ? { success: true, errors: [] } : { success: false, errors }
}
