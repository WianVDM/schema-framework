import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { ThemeConfig } from '../types'

const defaultTheme: ThemeConfig = {}

const ThemeContext = createContext<ThemeConfig>(defaultTheme)

export function ThemeProvider({
  theme,
  children,
}: {
  theme: ThemeConfig
  children: ReactNode
}) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeConfig {
  return useContext(ThemeContext)
}