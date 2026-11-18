import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../context/useAuth'
import { Field, FormActions } from './UI'

export function Login() {
  const { loginStaff, loginStudent } = useAuth()
  const [mode, setMode] = useState<'staff' | 'student'>('staff')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'staff') await loginStaff(identifier, password)
      else await loginStudent(identifier, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <h1>RollCallLedger</h1>
        <p className="muted">Attendance management system</p>

        <div className="tabs">
          <button
            type="button"
            className={mode === 'staff' ? 'active' : ''}
            onClick={() => {
              setMode('staff')
              setIdentifier('')
              setError('')
            }}
          >
            Staff
          </button>
          <button
            type="button"
            className={mode === 'student' ? 'active' : ''}
            onClick={() => {
              setMode('student')
              setIdentifier('')
              setError('')
            }}
          >
            Student
          </button>
        </div>

        <Field label={mode === 'staff' ? 'Email' : 'USN or email'}>
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder={mode === 'staff' ? 'you@college.edu' : '1BCA21CS001'}
            required
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Field>

        {error && <p className="error">{error}</p>}
        <FormActions submitLabel={busy ? 'Signing in...' : 'Sign in'} />
        <p className="hint">Demo password: pass12345</p>
      </form>
    </div>
  )
}
