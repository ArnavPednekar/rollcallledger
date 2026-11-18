import { createContext } from 'react'

export type Mode = 'light' | 'dark'

export interface ThemeValue {
  mode: Mode
  toggle: () => void
}

export const ThemeContext = createContext<ThemeValue | null>(null)
