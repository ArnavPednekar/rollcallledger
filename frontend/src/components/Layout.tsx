import { useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChartNoAxesCombined,
  ClipboardCheck,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  School,
  Sun,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/useTheme'
import { navForRole } from '../navigation'
import type { Page } from '../navigation'

function iconForPage(page: Page) {
  switch (page) {
    case 'students':
      return Users
    case 'classes':
      return School
    case 'attendance':
    case 'my-attendance':
      return ClipboardCheck
    case 'reports':
      return ChartNoAxesCombined
    case 'audit':
      return History
    default:
      return LayoutDashboard
  }
}

export function Layout({
  page,
  onNavigate,
  children,
}: {
  page: Page
  onNavigate: (page: Page) => void
  children: ReactNode
}) {
  const { session, logout } = useAuth()
  const { mode, toggle } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const items = session ? navForRole(session.role) : []

  const navigate = (next: Page) => {
    onNavigate(next)
    setMobileOpen(false)
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-400 text-white shadow-lg shadow-indigo-500/30">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-extrabold leading-tight tracking-tight">RollCallLedger</p>
          <p className="text-[11px] text-slate-400">Attendance suite</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {items.map((item) => {
          const Icon = iconForPage(item.page)
          const active = page === item.page
          return (
            <button
              key={item.page}
              type="button"
              onClick={() => navigate(item.page)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-indigo-500/15 to-teal-500/10 text-indigo-600 shadow-sm dark:text-indigo-300'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-slate-100 px-6 py-4 dark:border-slate-800">
        <p className="text-[11px] font-medium text-slate-400">v1.0 · Attendance management</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 dark:border-slate-800 lg:block">
        {sidebar}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-64 shadow-2xl lg:hidden"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="flex-1 truncate text-base font-bold sm:text-lg">
            {items.find((item) => item.page === page)?.label ?? 'Dashboard'}
          </h1>

          <span className="hidden rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 sm:inline">
            {session?.role}
          </span>

          <button
            type="button"
            onClick={toggle}
            title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {mode === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 text-[11px] font-bold text-white">
              {session?.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="max-w-36 truncate text-sm font-semibold">{session?.name}</span>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Log out"
            className="rounded-xl p-2 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
