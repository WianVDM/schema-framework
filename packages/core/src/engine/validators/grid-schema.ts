import { z } from 'zod'
import type { ZodIssue } from 'zod'
import {
  paginationConfigSchema,
  columnFilterConfigSchema,
  statusConfigSchema,
  serverPaginationConfigSchema,
  i18nConfigSchema,
} from './shared-schemas'
import type { ValidationResult } from './shared-schemas'

export const gridColumnSchemaValidator = z.object({
  key: z.string().min(1, 'Column key is required'),
  label: z.string().min(1, 'Column label is required'),
  type: z
    .enum(['text', 'number', 'date', 'boolean', 'status'])
    .optional(),
  sortable: z.boolean().optional(),
  width: z.string().optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  filterable: z.boolean().optional(),
  resizable: z.boolean().optional(),
  visible: z.boolean().optional(),
  filter: columnFilterConfigSchema.optional(),
  statusConfig: statusConfigSchema.optional(),
})

export const gridSchemaValidator = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  columns: z
    .array(gridColumnSchemaValidator)
    .min(1, 'Grid must have at least one column'),
  dataKey: z.string().min(1, 'Data key is required'),
  striped: z.boolean().optional(),
  bordered: z.boolean().optional(),
  hoverable: z.boolean().optional(),
  emptyMessage: z.string().optional(),
  pagination: z
    .union([paginationConfigSchema, z.boolean()])
    .optional(),
  filterable: z.boolean().optional(),
  resizable: z.boolean().optional(),
  columnVisibility: z.record(z.string(), z.boolean()).optional(),
  serverPagination: serverPaginationConfigSchema.optional(),
  i18n: i18nConfigSchema.optional(),
})

export function validateGridSchema(data: unknown): ValidationResult {
  const result = gridSchemaValidator.safeParse(data)
  if (result.success) {
    return { success: true, errors: [] }
  }
  return {
    success: false,
    errors: result.error.issues.map(
      (issue: ZodIssue) => `${issue.path.join('.')}: ${issue.message}`
    ),
  }
}