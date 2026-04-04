import { createServerFn } from '@tanstack/react-start'
import type { FormSchema } from '@my-framework/core'
import { registrationFormSchema } from '../data/registration-form-schema'

export const getRegistrationFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<FormSchema> => {
    return JSON.parse(JSON.stringify(registrationFormSchema))
  }
)