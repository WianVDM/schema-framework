import { createContext, useContext } from 'react'
import type { PrimitiveComponents } from '../types'

const primitivesContextDefaultValue: PrimitiveComponents = {
  Input: () => null,
  Select: () => null,
  SelectTrigger: () => null,
  SelectContent: () => null,
  SelectItem: () => null,
  SelectValue: () => null,
  Label: () => null,
  Textarea: () => null,
  Checkbox: () => null,
  Table: () => null,
  TableHeader: () => null,
  TableBody: () => null,
  TableRow: () => null,
  TableHead: () => null,
  TableCell: () => null,
  Button: () => null,
}

export const PrimitivesContext = createContext<PrimitiveComponents>(
  primitivesContextDefaultValue
)

export function PrimitivesProvider({
  primitives,
  children,
}: {
  primitives: PrimitiveComponents
  children: React.ReactNode
}) {
  return (
    <PrimitivesContext.Provider value={primitives}>
      {children}
    </PrimitivesContext.Provider>
  )
}

export function usePrimitives(): PrimitiveComponents {
  const ctx = useContext(PrimitivesContext)

  const isDefault =
    ctx.Input === primitivesContextDefaultValue.Input
  if (isDefault) {
    console.warn(
      'usePrimitives: No PrimitivesProvider found. ' +
        'Ensure your app wraps routes with <PrimitivesProvider>.'
    )
  }

  return ctx
}