import { createContext } from 'react'
import type { Session } from '../api/client'

export interface AuthValue {
  session: Session | null
  loginStaff: (email: string, password: string) => Promise<void>
  loginStudent: (identifier: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthValue | null>(null)
