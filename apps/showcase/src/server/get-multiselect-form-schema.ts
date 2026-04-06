import { createServerFn } from '@tanstack/react-start'
import type { FormSchema } from '@my-framework/core'
import { toSerializable } from '../lib/to-serializable'
import { multiselectFormSchema } from '../data/multiselect-form-schema'

export const getMultiselectFormSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<FormSchema> => {
    return toSerializable(multiselectFormSchema)
  }
)