import type { ReactNode } from 'react'
import { PrimitivesProvider } from '@my-framework/core'
import { primitives } from '../data/primitive-mappings'

export function AppPrimitivesProvider({ children }: { children: ReactNode }) {
  return <PrimitivesProvider primitives={primitives}>{children}</PrimitivesProvider>
}