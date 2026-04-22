import { z } from 'zod'
import type { AccordionConfig } from '../types/accordion-config'
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
    // NOTE: Guard against non-string elements in defaultOpen array
    if (typeof openId !== 'string') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `accordionConfig.defaultOpen contains a non-string value (got ${typeof openId})`,
        path: ['accordionConfig', 'defaultOpen'],
      })
      continue
    }
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

  // NOTE: Guard schema.regions is an array before extracting IDs
  if (!Array.isArray(schema.regions)) {
    return { success: false, errors: ['Accordion layout requires a regions array'] }
  }

  if (schema.regions.length === 0) {
    return { success: false, errors: ['Accordion layout requires at least one region'] }
  }

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
  validateDefaultOpenRuntime(schema.accordionConfig, ids, errors)

  return errors.length === 0 ? { success: true, errors: [] } : { success: false, errors }
}

/** Runtime validation of defaultOpen references — defensive checks for untyped runtime input */
function validateDefaultOpenRuntime(
  config: AccordionConfig | undefined,
  ids: IdEntry[],
  errors: string[],
): void {
  if (!config?.defaultOpen) return

  const idSet = new Set(ids.map(e => e.id))

  if (config.mode === 'multiple' && Array.isArray(config.defaultOpen)) {
    validateMultipleDefaultOpenRuntime(config.defaultOpen, idSet, errors)
  } else if (config.mode === 'multiple') {
    errors.push(
      `accordionConfig.defaultOpen must be an array of region ids when mode is "multiple" (got ${typeof config.defaultOpen})`,
    )
  } else if (typeof config.defaultOpen === 'string') {
    if (!idSet.has(config.defaultOpen)) {
      errors.push(
        `accordionConfig.defaultOpen "${config.defaultOpen}" does not match any region id`,
      )
    }
  } else {
    errors.push(
      `accordionConfig.defaultOpen must be a string when mode is "single" (got ${typeof config.defaultOpen})`,
    )
  }
}

/** Runtime validation for multiple-mode defaultOpen — guards against non-string elements */
function validateMultipleDefaultOpenRuntime(
  defaultOpen: readonly unknown[],
  idSet: Set<string>,
  errors: string[],
): void {
  for (const openId of defaultOpen) {
    if (typeof openId !== 'string') {
      errors.push(`accordionConfig.defaultOpen contains a non-string value (got ${typeof openId})`)
      continue
    }
    if (!idSet.has(openId)) {
      errors.push(`accordionConfig.defaultOpen "${openId}" does not match any region id`)
    }
  }
}
