import { createServerFn } from '@tanstack/react-start'
import type { GridSchema } from '@my-framework/core'
import { orderGridSchema } from '../data/order-grid-schema'

export const getOrderGridSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GridSchema> => {
    return JSON.parse(JSON.stringify(orderGridSchema))
  }
)