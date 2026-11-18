import type { ReactNode } from 'react'
import { navForRole } from '../navigation'
import type { Page } from '../navigation'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/useTheme'

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
  const { theme, toggle } = useTheme()
  const items = session ? navForRole(session.role) : []

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => items[0] && onNavigate(items[0].page)}>
          RollCallLedger
        </button>
        <div className="topbar-right">
          <button className="btn" type="button" onClick={toggle}>
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
          <span className="badge">{session?.role}</span>
          <span className="muted">{session?.name}</span>
          <button className="btn" type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <div className="body-row">
        <nav className="sidebar">
          {items.map((item) => (
            <button
              key={item.page}
              type="button"
              className={`nav-item${page === item.page ? ' active' : ''}`}
              onClick={() => onNavigate(item.page)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}
