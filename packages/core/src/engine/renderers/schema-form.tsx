import { useForm } from '@tanstack/react-form'
import type { SchemaFormProps, FieldSchema } from '../types'
import { validateFieldValue, evaluateCondition } from '../validators'
import { FieldRenderer } from './field-renderer'
import { usePrimitives } from '../context/primitives-context'
import { resolveMessage } from '../helpers/i18n'

export function SchemaForm({ schema, onSubmit, initialValues, onCancel }: SchemaFormProps) {
  const { Button } = usePrimitives()

  const fieldDefaults = buildDefaults(schema.fields, initialValues)

  const form = useForm({
    defaultValues: fieldDefaults,
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  const i18n = schema.i18n
  const submitLabel = resolveMessage('submit', i18n, schema.submitLabel ?? 'Submit')
  const cancelLabel = schema.cancelLabel
    ? resolveMessage('cancel', i18n, schema.cancelLabel)
    : null
  const submittingLabel = resolveMessage('submitting', i18n, 'Submitting...')

  const handleCancel = onCancel

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
        role="form"
        aria-label={schema.title ?? 'Form'}
      >
        <form.Subscribe selector={(state) => state.values}>
          {(values) => (
            <div
              className={
                schema.layout === 'grid'
                  ? 'grid grid-cols-2 gap-4'
                  : 'space-y-4'
              }
            >
              {schema.fields.map((field) => {
                if (!isFieldVisible(field, values)) {
                  return null
                }

                return (
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
                      <div
                        style={
                          schema.layout === 'grid' && field.colSpan
                            ? { gridColumn: `span ${field.colSpan} / span ${field.colSpan}` }
                            : undefined
                        }
                      >
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
                      </div>
                    )}
                  </form.Field>
                )
              })}
            </div>
          )}
        </form.Subscribe>
        <div className="flex justify-end gap-2 pt-2">
          {cancelLabel && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              aria-label={cancelLabel}
            >
              {cancelLabel}
            </Button>
          )}
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting ? submittingLabel : submitLabel}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  )
}

function isFieldVisible(
  field: FieldSchema,
  formValues: Record<string, unknown>
): boolean {
  if (!field.visibleWhen) return true
  return evaluateCondition(field.visibleWhen, formValues)
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