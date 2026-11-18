import { createContext } from 'react'

export type Severity = 'success' | 'error' | 'warning' | 'info'

export interface FeedbackValue {
  notify: (message: string, severity?: Severity) => void
  confirm: (title: string, message: string) => Promise<boolean>
}

export const FeedbackContext = createContext<FeedbackValue | null>(null)
