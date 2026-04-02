import { z } from 'zod'
import type { ZodIssue } from 'zod'

const fieldTypeSchema = z.enum([
  'text',
  'email',
  'number',
  'select',
  'textarea',
  'checkbox',
  'date',
  'password',
])

const selectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
})

const validationRuleSchema = z.object({
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

export const fieldSchemaValidator = z.object({
  name: z.string().min(1, 'Field name is required'),
  label: z.string().min(1, 'Field label is required'),
  type: fieldTypeSchema,
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  defaultValue: z.unknown().optional(),
  disabled: z.boolean().optional(),
  options: z
    .union([z.array(z.string()), z.array(selectOptionSchema)])
    .optional(),
  validation: z.array(validationRuleSchema).optional(),
  colSpan: z.number().int().positive().optional(),
  description: z.string().optional(),
})

export const formSchemaValidator = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  fields: z
    .array(fieldSchemaValidator)
    .min(1, 'Form must have at least one field'),
  submitLabel: z.string().optional(),
  layout: z.enum(['stack', 'grid']).optional(),
})

export const gridColumnSchemaValidator = z.object({
  key: z.string().min(1, 'Column key is required'),
  label: z.string().min(1, 'Column label is required'),
  type: z
    .enum(['text', 'number', 'date', 'boolean', 'status'])
    .optional(),
  sortable: z.boolean().optional(),
  width: z.string().optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
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
})

export type ValidatedFieldSchema = z.infer<typeof fieldSchemaValidator>
export type ValidatedFormSchema = z.infer<typeof formSchemaValidator>
export type ValidatedGridSchema = z.infer<typeof gridSchemaValidator>

export interface ValidationResult {
  success: boolean
  errors: string[]
}

export function validateFieldSchema(data: unknown): ValidationResult {
  const result = fieldSchemaValidator.safeParse(data)
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

export function validateFormSchema(data: unknown): ValidationResult {
  const result = formSchemaValidator.safeParse(data)
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

export function validateFieldValue(
  _value: unknown,
  field: { required?: boolean; validation?: { type: string; value?: string | number; message: string }[] }
): string | null {
  if (field.required && (_value === undefined || _value === null || _value === '')) {
    return 'This field is required'
  }

  if (field.validation) {
    for (const rule of field.validation) {
      const val = _value as string | number | undefined

      switch (rule.type) {
        case 'minLength':
          if (typeof val === 'string' && val.length < (rule.value as number)) {
            return rule.message
          }
          break
        case 'maxLength':
          if (typeof val === 'string' && val.length > (rule.value as number)) {
            return rule.message
          }
          break
        case 'min':
          if (typeof val === 'number' && val < (rule.value as number)) {
            return rule.message
          }
          break
        case 'max':
          if (typeof val === 'number' && val > (rule.value as number)) {
            return rule.message
          }
          break
        case 'email':
          if (
            typeof val === 'string' &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
          ) {
            return rule.message
          }
          break
        case 'pattern':
          if (
            typeof val === 'string' &&
            typeof rule.value === 'string' &&
            !new RegExp(rule.value).test(val)
          ) {
            return rule.message
          }
          break
      }
    }
  }

  return null
}