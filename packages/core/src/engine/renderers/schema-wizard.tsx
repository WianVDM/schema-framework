import { useState, useCallback, useRef, useMemo } from 'react'
import { useForm, type AnyFieldMetaBase } from '@tanstack/react-form'
import type { SchemaWizardProps, FieldSchema, StepIndicatorProps } from '../types'
import { validateFieldValue, evaluateCondition } from '../validators'
import { FieldRenderer } from './field-renderer'
import { WizardReviewStep } from './wizard-review-step'
import { usePrimitives } from '../context/primitives-context'
import { resolveMessage } from '../helpers/i18n'

export function SchemaWizard({ schema, onSubmit, initialValues, onCancel }: SchemaWizardProps) {
  const { Button, StepIndicator } = usePrimitives()
  const [currentStep, setCurrentStep] = useState(0)
  const [visitedSteps, setVisitedSteps] = useState<ReadonlySet<number>>(() => new Set([0]))
  const [showReview, setShowReview] = useState(false)

  const i18n = schema.i18n
  const nav = schema.navigation
  const validationMode = schema.validationMode ?? 'eager'
  const hasReviewStep = schema.reviewStep?.enabled === true
  const totalSteps = schema.steps.length
  const isLastStep = currentStep === totalSteps - 1
  const isReviewStep = showReview && hasReviewStep

  const nextLabel = resolveMessage('next', i18n, nav?.nextLabel ?? 'Next')
  const previousLabel = resolveMessage('previous', i18n, nav?.previousLabel ?? 'Previous')
  const submitLabel = resolveMessage('submit', i18n, nav?.submitLabel ?? schema.reviewStep ? 'Review & Submit' : 'Submit')
  const cancelLabel = resolveMessage('cancel', i18n, 'Cancel')
  const reviewTitle = schema.reviewStep?.title ?? 'Review Your Answers'
  const reviewDescription = schema.reviewStep?.description

  const fieldDefaults = useMemo(() => buildWizardDefaults(schema.steps, initialValues), [schema.steps, initialValues])

  const form = useForm({
    defaultValues: fieldDefaults,
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  const currentStepData = schema.steps[currentStep]
  const currentFields = currentStepData.schema.fields

  const formRef = useRef(form)
  formRef.current = form

  const handleNext = useCallback(async () => {
    if (isLastStep && hasReviewStep) {
      const allValid = await validateAllFields(formRef.current, schema.steps)
      if (!allValid && validationMode === 'eager') return
      setShowReview(true)
      return
    }

    if (validationMode === 'eager') {
      const stepValid = await validateStepFields(formRef.current, currentFields)
      if (!stepValid) return
    }

    const nextStep = currentStep + 1
    setVisitedSteps((prev) => new Set([...prev, nextStep]))
    setCurrentStep(nextStep)
  }, [currentStep, currentFields, form, hasReviewStep, isLastStep, validationMode, schema.steps])

  const handlePrevious = useCallback(() => {
    if (showReview) {
      setShowReview(false)
      return
    }
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep, showReview])

  const handleEditStep = useCallback((stepIndex: number) => {
    setShowReview(false)
    setCurrentStep(stepIndex)
  }, [])

  const StepIndicatorComponent = StepIndicator ?? DefaultStepIndicator

  const showStepIndicator = nav?.showStepIndicator !== false
  const showPreviousButton = nav?.showPreviousButton !== false

  return (
    <div>
      {schema.title && (
        <h2 className="text-xl font-bold mb-1">{schema.title}</h2>
      )}
      {schema.description && (
        <p className="text-sm text-muted-foreground mb-4">{schema.description}</p>
      )}

      {showStepIndicator && (
        <StepIndicatorComponent
          steps={schema.steps.map((s) => ({ title: s.title, description: s.description }))}
          currentStep={showReview ? totalSteps : currentStep}
          visitedSteps={visitedSteps}
        />
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6 mt-6"
        role="form"
        aria-label={schema.title ?? 'Wizard Form'}
      >
        {isReviewStep ? (
          <div>
            <h3 className="text-lg font-semibold mb-1">{reviewTitle}</h3>
            {reviewDescription && (
              <p className="text-sm text-muted-foreground mb-4">{reviewDescription}</p>
            )}
            <form.Subscribe selector={(state) => state.values}>
              {(values) => (
                <WizardReviewStep
                  steps={schema.steps}
                  values={values}
                  onEditStep={handleEditStep}
                  editable={schema.reviewStep?.editable !== false}
                />
              )}
            </form.Subscribe>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-1">{currentStepData.title}</h3>
            {currentStepData.description && (
              <p className="text-sm text-muted-foreground mb-4">{currentStepData.description}</p>
            )}
            <form.Subscribe selector={(state) => state.values}>
              {(values) => (
                <div className="space-y-4">
                  {currentFields.map((field) => {
                    if (!isFieldVisible(field, values)) return null

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
                    )
                  })}
                </div>
              )}
            </form.Subscribe>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <div>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                aria-label={cancelLabel}
              >
                {cancelLabel}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {showPreviousButton && (currentStep > 0 || showReview) && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                aria-label={previousLabel}
              >
                {previousLabel}
              </Button>
            )}
            {isReviewStep ? (
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit}>
                    {isSubmitting ? 'Submitting...' : submitLabel}
                  </Button>
                )}
              </form.Subscribe>
            ) : isLastStep && !hasReviewStep ? (
              <Button type="submit">
                {submitLabel}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                {nextLabel}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

function DefaultStepIndicator({ steps, currentStep, visitedSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 mb-6" role="navigation" aria-label="Wizard progress">
      {steps.map((step, index) => {
        const isCurrent = index === currentStep
        const isVisited = visitedSteps.has(index)
        const isPast = index < currentStep

        let circleClassName =
          'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium border-2 transition-colors'

        if (isCurrent) {
          circleClassName += ' border-primary bg-primary text-primary-foreground'
        } else if (isVisited || isPast) {
          circleClassName += ' border-primary text-primary'
        } else {
          circleClassName += ' border-muted-foreground/30 text-muted-foreground'
        }

        return (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <div
                className={`h-0.5 w-8 ${
                  isPast || isVisited ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            )}
            <div className="flex flex-col items-center">
              <div className={circleClassName} aria-current={isCurrent ? 'step' : undefined}>
                {index + 1}
              </div>
              <span
                className={`text-xs mt-1 max-w-[80px] text-center ${
                  isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function buildWizardDefaults(
  steps: readonly { readonly schema: { readonly fields: readonly FieldSchema[] } }[],
  initialValues?: Record<string, unknown>
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {}
  for (const step of steps) {
    for (const field of step.schema.fields) {
      if (initialValues && field.name in initialValues) {
        defaults[field.name] = initialValues[field.name]
      } else if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue
      } else {
        defaults[field.name] = field.type === 'checkbox' ? false : ''
      }
    }
  }
  return defaults
}

function isFieldVisible(
  field: FieldSchema,
  formValues: Record<string, unknown>
): boolean {
  if (!field.visibleWhen) return true
  return evaluateCondition(field.visibleWhen, formValues)
}

async function validateStepFields(
  formApi: FormApiForValidation,
  fields: readonly FieldSchema[]
): Promise<boolean> {
  let allValid = true
  for (const field of fields) {
    formApi.setFieldMeta(field.name, (prev) => ({ ...prev, isTouched: true }))
    const errors = await formApi.validateField(field.name, 'change')
    if (errors.length > 0) {
      allValid = false
    }
  }
  return allValid
}

async function validateAllFields(
  formApi: FormApiForValidation,
  steps: readonly { readonly schema: { readonly fields: readonly FieldSchema[] } }[]
): Promise<boolean> {
  let allValid = true
  for (const step of steps) {
    for (const field of step.schema.fields) {
      formApi.setFieldMeta(field.name, (prev) => ({ ...prev, isTouched: true }))
      const errors = await formApi.validateField(field.name, 'change')
      if (errors.length > 0) {
        allValid = false
      }
    }
  }
  return allValid
}

/**
 * NOTE: Subset of TanStack FormApi methods needed for step validation.
 * Only declares the methods we call so the signature stays decoupled
 * from the full FormApi generic surface.
 */
interface FormApiForValidation {
  readonly setFieldMeta: (
    field: string,
    updater: (prev: AnyFieldMetaBase) => AnyFieldMetaBase
  ) => void
  readonly validateField: (
    field: string,
    cause: 'change'
  ) => unknown[] | Promise<unknown[]>
}
