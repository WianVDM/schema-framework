import type { FormSchema } from './form-schema'
import type { FormSubmitHandler } from './form-submit-handler'

export interface SchemaFormProps {
  schema: FormSchema
  onSubmit: FormSubmitHandler
  initialValues?: Record<string, unknown>
  onCancel?: () => void
}