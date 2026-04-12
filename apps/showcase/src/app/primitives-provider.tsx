import type { ReactNode } from 'react'
import { PrimitivesProvider, LayoutPrimitivesProvider, CustomComponentProvider } from '@my-framework/core'
import type { CustomComponentRegistry } from '@my-framework/core'
import { primitives, layoutPrimitives } from '../data/primitive-mappings'

const EMPTY_COMPONENTS = {} as const satisfies CustomComponentRegistry

export function AppPrimitivesProvider({ children }: { children: ReactNode }) {
  return (
    <PrimitivesProvider primitives={primitives}>
      <LayoutPrimitivesProvider primitives={layoutPrimitives}>
        <CustomComponentProvider components={EMPTY_COMPONENTS}>
          {children}
        </CustomComponentProvider>
      </LayoutPrimitivesProvider>
    </PrimitivesProvider>
  )
}
