import { createServerFn } from '@tanstack/react-start'
import type { FormSchema } from '@my-framework/core'
import { contactFormSchema } from '../data/contact-form-schema'

// NOTE: Server functions return serializable JSON. GridColumnSchema.render
// is a client-side concern handled by the grid renderer.

export const getContactFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<FormSchema> => {
    return JSON.parse(JSON.stringify(contactFormSchema))
  }
)