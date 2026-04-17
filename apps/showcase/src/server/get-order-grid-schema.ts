import type { GridSchema } from '@my-framework/core'
import { createServerFn } from '@tanstack/react-start'
import { orderGridSchema } from '../data/order-grid-schema'
import { toSerializable } from '../lib/to-serializable'

export const getOrderGridSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GridSchema> => {
    return toSerializable(orderGridSchema)
  },
)
