import { createServerFn } from '@tanstack/react-start'
import type { FormSchema } from '@my-framework/core'
import { toSerializable } from '../lib/to-serializable'
import { contactFormSchema } from '../data/contact-form-schema'

// NOTE: Server functions return serializable JSON. Any presentation or rendering
// of this form schema is handled client-side.

export const getContactFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<FormSchema> => {
    return toSerializable(contactFormSchema)
  }
)
