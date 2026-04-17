import type { FormSubmitHandler } from './form-submit-handler'
import type { WizardSchema } from './wizard-schema'

export interface SchemaWizardProps {
  readonly schema: WizardSchema
  readonly onSubmit: FormSubmitHandler
  readonly initialValues?: Record<string, unknown>
  readonly onCancel?: () => void
  readonly onStepChange?: (stepIndex: number, direction: 'next' | 'previous' | 'jump') => void
}
