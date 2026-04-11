import { createContext, useContext } from 'react'
import type { LayoutPrimitiveComponents } from '../types'

const layoutPrimitivesDefaultValue: LayoutPrimitiveComponents = {
  Panel: undefined,
  Splitter: undefined,
  Tabs: undefined,
  Accordion: undefined,
  Card: undefined,
  Separator: undefined,
  Collapsible: undefined,
  ScrollArea: undefined,
  ResizablePanelGroup: undefined,
  ResizablePanel: undefined,
  ResizableHandle: undefined,
}

export const LayoutPrimitivesContext = createContext<LayoutPrimitiveComponents>(
  layoutPrimitivesDefaultValue
)

export function LayoutPrimitivesProvider({
  primitives,
  children,
}: {
  primitives: LayoutPrimitiveComponents
  children: React.ReactNode
}) {
  return (
    <LayoutPrimitivesContext.Provider value={primitives}>
      {children}
    </LayoutPrimitivesContext.Provider>
  )
}

export function useLayoutPrimitives(): LayoutPrimitiveComponents {
  const ctx = useContext(LayoutPrimitivesContext)

  const isDefault =
    ctx === layoutPrimitivesDefaultValue
  if (isDefault) {
    console.warn(
      'useLayoutPrimitives: No LayoutPrimitivesProvider found. ' +
        'Ensure your app wraps routes with <LayoutPrimitivesProvider>.'
    )
  }

  return ctx
}