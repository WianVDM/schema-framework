import { createServerFn } from '@tanstack/react-start'
import type { SerializableRecord } from '../lib/serializable-record'
import { mockVirtualData } from '../data/mock-virtual-data'
import { toSerializable } from '../lib/to-serializable'

export const getVirtualData = createServerFn({ method: 'GET' }).handler(
  async (): Promise<readonly SerializableRecord[]> => {
    return toSerializable(mockVirtualData)
  }
)
