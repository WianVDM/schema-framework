import { createServerFn } from '@tanstack/react-start'
import type { FormSchema } from '@my-framework/core'
import { toSerializable } from '../lib/to-serializable'
import { supportTicketFormSchema } from '../data/support-ticket-form-schema'

export const getSupportTicketFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<FormSchema> => {
    return toSerializable(supportTicketFormSchema)
  }
)
