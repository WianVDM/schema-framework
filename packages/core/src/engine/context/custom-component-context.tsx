import { createContext, useContext } from 'react'
import type { CustomComponentRegistry } from '../types/custom-component-registry'

/** Silent empty fallback — custom components are always optional */
const customComponentDefaultValue: CustomComponentRegistry = {}

export const CustomComponentContext = createContext<CustomComponentRegistry>(
  customComponentDefaultValue
)

export function CustomComponentProvider({
  components,
  children,
}: {
  components: CustomComponentRegistry
  children: React.ReactNode
}) {
  return (
    <CustomComponentContext.Provider value={components}>
      {children}
    </CustomComponentContext.Provider>
  )
}

export function useCustomComponents(): CustomComponentRegistry {
  return useContext(CustomComponentContext)
}