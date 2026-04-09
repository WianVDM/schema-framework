import type { WizardSchema } from './wizard-schema'
import type { FormSubmitHandler } from './form-submit-handler'

export interface SchemaWizardProps {
  readonly schema: WizardSchema
  readonly onSubmit: FormSubmitHandler
  readonly initialValues?: Record<string, unknown>
  readonly onCancel?: () => void
}