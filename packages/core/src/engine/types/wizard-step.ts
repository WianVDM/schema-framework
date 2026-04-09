import type { FormSchema } from './form-schema'

export interface WizardStep {
  readonly title: string
  readonly description?: string
  readonly schema: FormSchema
  readonly optional?: boolean
}