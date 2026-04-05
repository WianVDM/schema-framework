import { createServerFn } from '@tanstack/react-start'
import type { GridSchema } from '@my-framework/core'
import { toSerializable } from '../lib/to-serializable'
import { orderGridSchema } from '../data/order-grid-schema'

export const getOrderGridSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GridSchema> => {
    return toSerializable(orderGridSchema)
  }
)
