import { useContext } from 'react'
import type { ThemeConfig } from '../types'
import { ThemeContext } from './theme-provider'

export function useTheme(): ThemeConfig {
  return useContext(ThemeContext)
}
