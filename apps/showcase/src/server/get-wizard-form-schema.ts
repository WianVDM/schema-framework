import { createServerFn } from '@tanstack/react-start'
import type { WizardSchema } from '@my-framework/core'
import { toSerializable } from '../lib/to-serializable'
import { wizardFormSchema } from '../data/wizard-form-schema'

export const getWizardFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<WizardSchema> => {
    return toSerializable(wizardFormSchema)
  }
)