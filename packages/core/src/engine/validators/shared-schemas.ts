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
  'multiselect',
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

export const datePickerConfigSchema = z.object({
  format: z.string().optional(),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
  placeholder: z.string().optional(),
}).strict().refine(
  (data) => {
    if (data.minDate && isNaN(Date.parse(data.minDate))) return false
    if (data.maxDate && isNaN(Date.parse(data.maxDate))) return false
    if (data.minDate && data.maxDate && new Date(data.minDate) > new Date(data.maxDate)) return false
    return true
  },
  {
    message: 'minDate/maxDate must be valid date strings and minDate must be <= maxDate',
  },
)

export const multiSelectConfigSchema = z.object({
  options: z.array(selectOptionSchema),
  maxSelections: z.number().int().positive().optional(),
  creatable: z.boolean().optional(),
  placeholder: z.string().optional(),
}).strict()

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
  locale: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Locale must be in format "en" or "en-US"'),
  messages: z.record(z.string(), z.string()).optional(),
})

export const virtualScrollConfigSchema = z.object({
  enabled: z.literal(true),
  overscan: z.number().int().min(0).optional(),
  rowHeight: z.number().int().positive().optional(),
  containerHeight: z.number().int().positive().optional(),
}).strict()

export interface ValidationResult {
  success: boolean
  errors: string[]
}