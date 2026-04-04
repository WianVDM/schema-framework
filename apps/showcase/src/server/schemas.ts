import { createServerFn } from '@tanstack/react-start'
import {
  contactFormSchema,
  userGridSchema,
  orderGridSchema,
  registrationFormSchema,
  supportTicketFormSchema,
} from '../data/mock-schemas'
import type { GridSchema, FormSchema, FieldSchema } from '@my-framework/core'

// NOTE: Server functions return serializable JSON. FormSchema's ValidationRule.validate
// is a function property that cannot cross the serialization boundary, so we omit it.
// GridColumnSchema.render is a client-side concern handled by the grid renderer.

type SerializableFieldSchema = Omit<FieldSchema, 'validation'>

type SerializableFormSchema = Omit<FormSchema, 'fields'> & {
  readonly fields: readonly SerializableFieldSchema[]
}

export const getContactFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SerializableFormSchema> => {
    return JSON.parse(JSON.stringify(contactFormSchema)) as SerializableFormSchema
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
    return JSON.parse(JSON.stringify(registrationFormSchema)) as SerializableFormSchema
  }
)

export const getSupportTicketFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SerializableFormSchema> => {
    return JSON.parse(JSON.stringify(supportTicketFormSchema)) as SerializableFormSchema
  }
)
