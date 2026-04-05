import { createServerFn } from '@tanstack/react-start'
import type { SerializableRecord } from '../lib/serializable-record'
import { mockVirtualData } from '../data/mock-virtual-data'

export const getVirtualData = createServerFn({ method: 'GET' }).handler(
  async (): Promise<readonly SerializableRecord[]> => {
    return mockVirtualData as unknown as readonly SerializableRecord[]
  }
)
