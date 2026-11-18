import { useState } from 'react'
import { Login } from './components/Login'
import { Layout } from './components/Layout'
import { AuthProvider } from './context/AuthProvider'
import { ThemeProvider } from './context/ThemeProvider'
import { useAuth } from './context/useAuth'
import { navForRole } from './navigation'
import type { Page } from './navigation'
import { Attendance } from './pages/Attendance'
import { AuditLog } from './pages/AuditLog'
import { Classes } from './pages/Classes'
import { Dashboard } from './pages/Dashboard'
import { MyAttendance } from './pages/MyAttendance'
import { Reports } from './pages/Reports'
import { Students } from './pages/Students'

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
      {render()}
    </Layout>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </ThemeProvider>
  )
}
