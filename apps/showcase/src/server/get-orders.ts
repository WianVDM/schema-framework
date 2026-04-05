import { createServerFn } from '@tanstack/react-start'
import type { SerializableRecord } from '../lib/serializable-record'
import { mockOrders } from '../data/mock-orders'

export const getOrders = createServerFn({ method: 'GET' }).handler(
  async (): Promise<readonly SerializableRecord[]> => {
    return mockOrders
  }
)