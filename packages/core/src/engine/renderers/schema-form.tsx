import { useState, useCallback } from 'react'
import type { SchemaFormProps, FieldSchema } from '../types'
import { validateFieldValue } from '../validators'
import { FieldRenderer } from './field-renderer'
import { usePrimitives } from '../context/primitives-context'

export function SchemaForm({ schema, onSubmit, initialValues }: SchemaFormProps) {
  const { Button } = usePrimitives()

  const fieldDefaults = buildDefaults(schema.fields, initialValues)
  const [values, setValues] = useState<Record<string, unknown>>(fieldDefaults)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((fieldName: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[fieldName]
      return next
    })
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const validationErrors: Record<string, string> = {}
      for (const field of schema.fields) {
        const error = validateFieldValue(values[field.name], field)
        if (error) {
          validationErrors[field.name] = error
        }
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } finally {
        setIsSubmitting(false)
      }
    },
    [schema.fields, values, onSubmit]
  )

  const isGridLayout = schema.layout === 'grid'

  return (
    <div>
      {schema.title && (
        <h2 className="text-xl font-bold mb-1">{schema.title}</h2>
      )}
      {schema.description && (
        <p className="text-sm text-muted-foreground mb-4">
          {schema.description}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className={
            isGridLayout
              ? 'grid grid-cols-2 gap-4'
              : 'space-y-4'
          }
        >
          {schema.fields.map((field) => (
            <FieldRenderer
              key={field.name}
              schema={field}
              value={values[field.name]}
              onChange={(val) => handleChange(field.name, val)}
              error={errors[field.name]}
            />
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : (schema.submitLabel ?? 'Submit')}
          </Button>
        </div>
      </form>
    </div>
  )
}

function buildDefaults(
  fields: FieldSchema[],
  initialValues?: Record<string, unknown>
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {}
  for (const field of fields) {
    if (initialValues && field.name in initialValues) {
      defaults[field.name] = initialValues[field.name]
    } else if (field.defaultValue !== undefined) {
      defaults[field.name] = field.defaultValue
    } else {
      defaults[field.name] = field.type === 'checkbox' ? false : ''
    }
  }
  return defaults
}