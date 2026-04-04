import { createServerFn } from '@tanstack/react-start'
import { mockOrders } from '../data/mock-orders'

type SerializableRecord = Record<string, string | number | boolean | null>

export const getOrders = createServerFn({ method: 'GET' }).handler(
  async (): Promise<readonly SerializableRecord[]> => {
    return mockOrders
  }
)