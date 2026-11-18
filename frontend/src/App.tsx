import { lazy, Suspense, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Login } from './components/Login'
import { Layout } from './components/Layout'
import { Loading } from './components/Loading'
import { AuthProvider } from './context/AuthProvider'
import { FeedbackProvider } from './context/FeedbackProvider'
import { ThemeProvider } from './context/ThemeProvider'
import { useAuth } from './context/useAuth'
import { navForRole } from './navigation'
import type { Page } from './navigation'

const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Students = lazy(() => import('./pages/Students').then((m) => ({ default: m.Students })))
const Classes = lazy(() => import('./pages/Classes').then((m) => ({ default: m.Classes })))
const Attendance = lazy(() => import('./pages/Attendance').then((m) => ({ default: m.Attendance })))
const Reports = lazy(() => import('./pages/Reports').then((m) => ({ default: m.Reports })))
const AuditLog = lazy(() => import('./pages/AuditLog').then((m) => ({ default: m.AuditLog })))
const MyAttendance = lazy(() =>
  import('./pages/MyAttendance').then((m) => ({ default: m.MyAttendance })),
)

function Shell() {
  const { session } = useAuth()
  const [page, setPage] = useState<Page>('dashboard')

  if (!session) return <Login />

  const allowed = navForRole(session.role).map((item) => item.page)
  const active: Page = allowed.includes(page) ? page : allowed[0]

  const render = () => {
    switch (active) {
      case 'students':
        return <Students />
      case 'classes':
        return <Classes />
      case 'attendance':
        return <Attendance />
      case 'reports':
        return <Reports />
      case 'audit':
        return <AuditLog />
      case 'my-attendance':
        return <MyAttendance />
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout page={active} onNavigate={setPage}>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <Suspense fallback={<Loading />}>{render()}</Suspense>
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <FeedbackProvider>
          <AuthProvider>
            <Shell />
          </AuthProvider>
        </FeedbackProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
