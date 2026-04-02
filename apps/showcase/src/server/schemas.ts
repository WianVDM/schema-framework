import { createServerFn } from '@tanstack/react-start'
import { contactFormSchema, userGridSchema } from '../data/mock-schemas'
import type { FormSchema, GridSchema } from '@my-framework/core'

// NOTE: Server functions return serializable JSON. The render property on
// GridColumnSchema (a function) is a client-side concern and cannot cross
// the server boundary. Schemas returned here are plain JSON metadata.

export const getContactFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<FormSchema> => {
    return JSON.parse(JSON.stringify(contactFormSchema))
  }
)

export const getUserGridSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GridSchema> => {
    return JSON.parse(JSON.stringify(userGridSchema))
  }
)