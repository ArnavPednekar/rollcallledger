import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, clearSession, loadSession, saveSession } from '../api/client'
import type { Session } from '../api/client'
import { AuthContext } from './auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession())

  const loginStaff = useCallback(async (email: string, password: string) => {
    const response = await api.loginStaff(email, password)
    const next: Session = {
      token: response.token,
      id: response.id,
      name: response.name,
      role: response.role,
    }
    saveSession(next)
    setSession(next)
  }, [])

  const loginStudent = useCallback(async (identifier: string, password: string) => {
    const response = await api.loginStudent(identifier, password)
    const next: Session = {
      token: response.token,
      id: response.id,
      name: response.name,
      role: response.role,
    }
    saveSession(next)
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({ session, loginStaff, loginStudent, logout }),
    [session, loginStaff, loginStudent, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
