import type { FormSchema } from './form-schema'
import type { FormSubmitHandler } from './form-submit-handler'

export interface SchemaFormProps {
  readonly schema: FormSchema
  readonly onSubmit: FormSubmitHandler
  readonly initialValues?: Readonly<Record<string, unknown>>
  readonly onCancel?: () => void
}