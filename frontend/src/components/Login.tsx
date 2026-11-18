import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, LockKeyhole, Mail, Moon, Sun, UserRound } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/useTheme'

export function Login() {
  const { loginStaff, loginStudent } = useAuth()
  const { mode, toggle } = useTheme()
  const [modeValue, setModeValue] = useState<'staff' | 'student'>('staff')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (modeValue === 'staff') await loginStaff(identifier, password)
      else await loginStudent(identifier, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 p-4 dark:bg-slate-950">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/20" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-600/20" />

      <button
        type="button"
        onClick={toggle}
        title="Toggle theme"
        className="absolute right-5 top-5 z-10 rounded-xl border border-slate-200 bg-white/70 p-2.5 text-slate-500 backdrop-blur hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:text-white"
      >
        {mode === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-2xl shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:p-9">
          <div className="mb-5 flex flex-col items-center text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-400 text-white shadow-lg shadow-indigo-500/30">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight">RollCallLedger</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Sign in to manage attendance
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            {(['staff', 'student'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setModeValue(value)
                  setIdentifier('')
                  setError('')
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold capitalize transition-all ${
                  modeValue === value
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {value === 'staff' ? (
                  <UserRound className="h-4 w-4" />
                ) : (
                  <GraduationCap className="h-4 w-4" />
                )}
                {value}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                {modeValue === 'staff' ? 'Email address' : 'USN or email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder={modeValue === 'staff' ? 'you@college.edu' : '1BCA21CS001'}
                  autoComplete="username"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-center dark:border-slate-700">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Demo credentials
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Staff: anita.rao@college.edu · Student: 1BCA21CS001
            </p>
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">
              Password: pass12345
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
