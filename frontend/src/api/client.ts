import type {
  AttendanceRecord,
  AttendanceSummary,
  AuditEntry,
  ClassItem,
  LoginResponse,
  Role,
  StaffProfile,
  Student,
} from './types'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const SESSION_KEY = 'rollcallledger.session'

export interface Session {
  token: string
  id: string
  name: string
  role: Role
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = loadSession()
  const headers = new Headers(init.headers)
  if (init.body !== undefined) headers.set('content-type', 'application/json')
  if (session) headers.set('authorization', `Bearer ${session.token}`)

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers })
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      message = `Request failed (${response.status})`
    }
    throw new Error(message)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

function body(value: unknown): string {
  return JSON.stringify(value)
}

export const api = {
  loginStaff: (email: string, password: string) =>
    request<LoginResponse>('/api/auth/staff/login', {
      method: 'POST',
      body: body({ email, password }),
    }),

  loginStudent: (identifier: string, password: string) =>
    request<LoginResponse>('/api/auth/student/login', {
      method: 'POST',
      body: body({ identifier, password }),
    }),

  me: () => request<StaffProfile>('/api/staff/me'),

  students: () => request<Student[]>('/api/students'),
  createStudent: (data: Omit<Student, 'usn'> & { password: string; usn: string }) =>
    request<Student>('/api/students', { method: 'POST', body: body(data) }),
  updateStudent: (usn: string, data: Omit<Student, 'usn'> & { password: string | null }) =>
    request<Student>(`/api/students/${encodeURIComponent(usn)}`, {
      method: 'PUT',
      body: body(data),
    }),
  deleteStudent: (usn: string) =>
    request<void>(`/api/students/${encodeURIComponent(usn)}`, { method: 'DELETE' }),

  classes: () => request<ClassItem[]>('/api/classes'),
  createClass: (data: Omit<ClassItem, 'class_id'>) =>
    request<ClassItem>('/api/classes', { method: 'POST', body: body(data) }),
  updateClass: (id: number, data: Omit<ClassItem, 'class_id'>) =>
    request<ClassItem>(`/api/classes/${id}`, { method: 'PUT', body: body(data) }),
  deleteClass: (id: number) => request<void>(`/api/classes/${id}`, { method: 'DELETE' }),

  attendance: (params: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') query.set(key, String(value))
    }
    const suffix = query.toString()
    return request<AttendanceRecord[]>(`/api/attendance${suffix ? `?${suffix}` : ''}`)
  },
  markAttendance: (data: {
    usn: string
    class_id: number
    date: string
    status: string
  }) =>
    request<AttendanceRecord>('/api/attendance', { method: 'POST', body: body(data) }),
  updateAttendance: (id: number, status: string) =>
    request<AttendanceRecord>(`/api/attendance/${id}`, {
      method: 'PUT',
      body: body({ status }),
    }),
  deleteAttendance: (id: number) =>
    request<void>(`/api/attendance/${id}`, { method: 'DELETE' }),

  reports: () => request<AttendanceSummary[]>('/api/reports/attendance'),
  audit: (limit = 100) => request<AuditEntry[]>(`/api/audit?limit=${limit}`),

  myAttendance: () => request<AttendanceRecord[]>('/api/me/attendance'),
  mySummary: () => request<AttendanceSummary[]>('/api/me/summary'),
}
