import type { ReactNode } from 'react'
import { PrimitivesProvider, LayoutPrimitivesProvider, CustomComponentProvider } from '@my-framework/core'
import { primitives, layoutPrimitives } from '../data/primitive-mappings'

export function AppPrimitivesProvider({ children }: { children: ReactNode }) {
  return (
    <PrimitivesProvider primitives={primitives}>
      <LayoutPrimitivesProvider primitives={layoutPrimitives}>
        <CustomComponentProvider components={{}}>
          {children}
        </CustomComponentProvider>
      </LayoutPrimitivesProvider>
    </PrimitivesProvider>
  )
}
