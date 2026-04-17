import type { GridSchema } from '@my-framework/core'
import { createServerFn } from '@tanstack/react-start'
import { virtualGridSchema } from '../data/virtual-grid-schema'
import { toSerializable } from '../lib/to-serializable'

export const getVirtualGridSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GridSchema> => {
    return toSerializable(virtualGridSchema)
  },
)
