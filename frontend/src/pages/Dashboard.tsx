import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { AttendanceRecord, ClassItem, Student } from '../api/types'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import { ErrorMessage, PageHeader } from '../components/UI'

export function Dashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.students(), api.classes(), api.attendance({ limit: 5 })])
      .then(([s, c, a]) => {
        setStudents(s)
        setClasses(c)
        setAttendance(a)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [])

  const columns: Column<AttendanceRecord>[] = [
    { header: 'USN', cell: (row) => row.usn },
    { header: 'Class', cell: (row) => String(row.class_id) },
    { header: 'Date', cell: (row) => row.date },
    { header: 'Status', cell: (row) => row.status },
  ]

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of the attendance system" />
      <ErrorMessage message={error} />
      <div className="stat-grid">
        <div className="stat">
          <span className="stat-value">{students.length}</span>
          <span className="muted">Students</span>
        </div>
        <div className="stat">
          <span className="stat-value">{classes.length}</span>
          <span className="muted">Classes</span>
        </div>
        <div className="stat">
          <span className="stat-value">{attendance.length}</span>
          <span className="muted">Recent records</span>
        </div>
      </div>
      <h3>Recent attendance</h3>
      <DataTable columns={columns} rows={attendance} empty="No attendance records yet." />
    </>
  )
}
