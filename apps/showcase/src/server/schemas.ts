import { createServerFn } from '@tanstack/react-start'
import {
  contactFormSchema,
  userGridSchema,
  orderGridSchema,
  registrationFormSchema,
  supportTicketFormSchema,
} from '../data/mock-schemas'
import type { GridSchema, FormSchema } from '@my-framework/core'

// NOTE: Server functions return serializable JSON. GridColumnSchema.render
// is a client-side concern handled by the grid renderer.

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

export const getOrderGridSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GridSchema> => {
    return JSON.parse(JSON.stringify(orderGridSchema))
  }
)

export const getRegistrationFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<FormSchema> => {
    return JSON.parse(JSON.stringify(registrationFormSchema))
  }
)

export const getSupportTicketFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<FormSchema> => {
    return JSON.parse(JSON.stringify(supportTicketFormSchema))
  }
)