import { createServerFn } from '@tanstack/react-start'
import {
  contactFormSchema,
  userGridSchema,
  orderGridSchema,
  registrationFormSchema,
  supportTicketFormSchema,
} from '../data/mock-schemas'
import type { GridSchema } from '@my-framework/core'

// NOTE: Server functions return serializable JSON. The render property on
// GridColumnSchema (a function) is a client-side concern and cannot cross
// the server boundary. Schemas returned here are plain JSON metadata.
// FormSchema has an onCancel callback that is not serializable, so we use
// Omit to exclude it from the server return type.

type SerializableFormSchema = Omit<import('@my-framework/core').FormSchema, 'onCancel'>

export const getContactFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SerializableFormSchema> => {
    return JSON.parse(JSON.stringify(contactFormSchema))
  }
)

export const getUserGridSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GridSchema> => {
    return JSON.parse(JSON.stringify(userGridSchema))
  }
)

export const getOrderGridSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GridSchema> => {
    return JSON.parse(JSON.stringify(orderGridSchema))
  }
)

export const getRegistrationFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SerializableFormSchema> => {
    return JSON.parse(JSON.stringify(registrationFormSchema))
  }
)

export const getSupportTicketFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SerializableFormSchema> => {
    return JSON.parse(JSON.stringify(supportTicketFormSchema))
  }
)
