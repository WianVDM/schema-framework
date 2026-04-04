import { z } from 'zod'

export const fieldTypeSchema = z.enum([
  'text',
  'email',
  'number',
  'select',
  'textarea',
  'checkbox',
  'date',
  'password',
  'file',
  'address',
])

export const selectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
})

export const validationRuleSchema = z.object({
  type: z.enum([
    'required',
    'min',
    'max',
    'minLength',
    'maxLength',
    'pattern',
    'email',
    'custom',
  ]),
  value: z.union([z.string(), z.number()]).optional(),
  message: z.string(),
})

export const fieldConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['equals', 'notEquals', 'in', 'notIn', 'truthy', 'falsy']),
  value: z
    .union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number()]))])
    .optional(),
})

export const fileUploadConfigSchema = z.object({
  accept: z.string().optional(),
  maxSize: z.number().positive().optional(),
  multiple: z.boolean().optional(),
})

export const paginationConfigSchema = z.object({
  pageSize: z.number().int().positive().default(10),
  pageSizeOptions: z.array(z.number().int().positive()).optional(),
  showPageSizeSelector: z.boolean().optional(),
})

export const columnFilterConfigSchema = z.object({
  enabled: z.boolean(),
  placeholder: z.string().optional(),
})

export const statusConfigSchema = z.object({
  variants: z.record(
    z.string(),
    z.object({
      label: z.string(),
      className: z.string(),
    })
  ),
})

export const serverPaginationConfigSchema = z.object({
  totalRecords: z.number().int().min(0),
  currentPage: z.number().int().min(0),
})

export const i18nConfigSchema = z.object({
  locale: z.string(),
  messages: z.record(z.string(), z.string()).optional(),
})

export interface ValidationResult {
  success: boolean
  errors: string[]
}