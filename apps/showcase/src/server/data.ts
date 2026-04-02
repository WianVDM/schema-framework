import { createServerFn } from '@tanstack/react-start'
import { mockUsers, mockOrders } from '../data/mock-schemas'

type SerializableRecord = Record<string, string | number | boolean | null>

export const getUsers = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SerializableRecord[]> => {
    return mockUsers as SerializableRecord[]
  }
)

export const getOrders = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SerializableRecord[]> => {
    return mockOrders as SerializableRecord[]
  }
)