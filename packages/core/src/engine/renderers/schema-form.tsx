import { useForm } from '@tanstack/react-form'
import type { SchemaFormProps, FieldSchema } from '../types'
import { validateFieldValue } from '../validators'
import { FieldRenderer } from './field-renderer'
import { usePrimitives } from '../context/primitives-context'

export function SchemaForm({ schema, onSubmit, initialValues }: SchemaFormProps) {
  const { Button } = usePrimitives()

  const fieldDefaults = buildDefaults(schema.fields, initialValues)

  const form = useForm({
    defaultValues: fieldDefaults,
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

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
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        <div
          className={
            schema.layout === 'grid'
              ? 'grid grid-cols-2 gap-4'
              : 'space-y-4'
          }
        >
          {schema.fields.map((field) => (
            <form.Field
              key={field.name}
              name={field.name}
              validators={{
                onChange: ({ value }) => {
                  const error = validateFieldValue(value, field)
                  return error ?? undefined
                },
              }}
            >
              {(fieldApi) => (
                <FieldRenderer
                  schema={field}
                  value={fieldApi.state.value}
                  onChange={(val) => fieldApi.handleChange(val)}
                  error={
                    fieldApi.state.meta.isTouched &&
                    !fieldApi.state.meta.isValid
                      ? fieldApi.state.meta.errors.join(', ')
                      : undefined
                  }
                />
              )}
            </form.Field>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting
                  ? 'Submitting...'
                  : (schema.submitLabel ?? 'Submit')}
              </Button>
            )}
          </form.Subscribe>
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