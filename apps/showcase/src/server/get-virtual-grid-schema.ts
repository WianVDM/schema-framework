import { createServerFn } from '@tanstack/react-start'
import type { GridSchema } from '@my-framework/core'
import { toSerializable } from '../lib/to-serializable'
import { virtualGridSchema } from '../data/virtual-grid-schema'

export const getVirtualGridSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GridSchema> => {
    return toSerializable(virtualGridSchema)
  }
)