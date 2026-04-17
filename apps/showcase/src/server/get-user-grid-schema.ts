import type { GridSchema } from '@my-framework/core'
import { createServerFn } from '@tanstack/react-start'
import { userGridSchema } from '../data/user-grid-schema'
import { toSerializable } from '../lib/to-serializable'

export const getUserGridSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GridSchema> => {
    return toSerializable(userGridSchema)
  },
)
