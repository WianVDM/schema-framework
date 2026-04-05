import { createServerFn } from '@tanstack/react-start'
import type { FormSchema } from '@my-framework/core'
import { toSerializable } from '../lib/to-serializable'
import { registrationFormSchema } from '../data/registration-form-schema'

export const getRegistrationFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<FormSchema> => {
    return toSerializable(registrationFormSchema)
  }
)
