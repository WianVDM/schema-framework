import type { FieldSchema } from '../types'
import { usePrimitives } from '../context/primitives-context'

interface WizardReviewStepProps {
  readonly steps: readonly {
    readonly title: string
    readonly description?: string
    readonly schema: { readonly fields: readonly FieldSchema[] }
  }[]
  readonly values: Record<string, unknown>
  readonly onEditStep: (stepIndex: number) => void
  readonly editable: boolean
}

export function WizardReviewStep({ steps, values, onEditStep, editable }: WizardReviewStepProps) {
  const { Button } = usePrimitives()

  return (
    <div className="space-y-6">
      {steps.map((step, stepIndex) => (
        <div key={stepIndex} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg">{step.title}</h3>
              {step.description && (
                <p className="text-sm text-muted-foreground">{step.description}</p>
              )}
            </div>
            {editable && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEditStep(stepIndex)}
              >
                Edit
              </Button>
            )}
          </div>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            {step.schema.fields.map((field) => {
              const fieldValue = values[field.name]
              const displayValue = formatDisplayValue(fieldValue, field)
              return (
                <div key={field.name}>
                  <dt className="text-sm font-medium text-muted-foreground">{field.label}</dt>
                  <dd className="text-sm mt-0.5">{displayValue}</dd>
                </div>
              )
            })}
          </dl>
        </div>
      ))}
    </div>
  )
}

function formatDisplayValue(value: unknown, field: FieldSchema): string {
  if (value === undefined || value === null || value === '') return '—'
  if (field.type === 'checkbox') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) {
    if (value.length === 0) return '—'
    return value.map((v) => String(v)).join(', ')
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}