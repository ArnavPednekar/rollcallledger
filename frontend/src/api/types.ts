export type Role = 'staff' | 'student'

export interface LoginResponse {
  token: string
  token_type: string
  id: string
  name: string
  role: Role
}

export interface StaffProfile {
  staff_id: number
  s_name: string
  emailid: string
  ph_no: string | null
}

export interface Student {
  usn: string
  s_name: string
  sem: number | null
  ph_no: string | null
  emailid: string
}

export interface ClassItem {
  class_id: number
  class_name: string
  class_pro: string | null
  room_no: string | null
  schedule: string | null
  staff_id: number | null
}

export interface AttendanceRecord {
  rec_id: number
  usn: string
  class_id: number
  staff_id: number | null
  date: string
  status: string
  timestamp: string
}

export interface AttendanceSummary {
  usn: string
  student_name: string
  class_id: number
  class_name: string
  total_classes: number
  present_count: number
  absent_count: number
  late_count: number
  excused_count: number
  attendance_percentage: number
}

export interface AuditEntry {
  log_id: number
  staff_id: number | null
  action_type: string
  action_timestamp: string
}
