export type Page =
  | 'dashboard'
  | 'students'
  | 'classes'
  | 'attendance'
  | 'reports'
  | 'audit'
  | 'my-attendance'

export interface NavItem {
  page: Page
  label: string
}

export const staffNav: NavItem[] = [
  { page: 'dashboard', label: 'Dashboard' },
  { page: 'students', label: 'Students' },
  { page: 'classes', label: 'Classes' },
  { page: 'attendance', label: 'Attendance' },
  { page: 'reports', label: 'Reports' },
  { page: 'audit', label: 'Audit Log' },
]

export const studentNav: NavItem[] = [
  { page: 'my-attendance', label: 'My Attendance' },
]

export function navForRole(role: 'staff' | 'student'): NavItem[] {
  return role === 'staff' ? staffNav : studentNav
}
