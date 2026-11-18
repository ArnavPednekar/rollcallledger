import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { AttendanceRecord, AttendanceSummary } from '../api/types'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import { ErrorMessage, PageHeader } from '../components/UI'
import { useAuth } from '../context/useAuth'

export function MyAttendance() {
  const { session } = useAuth()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [summary, setSummary] = useState<AttendanceSummary[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.myAttendance(), api.mySummary()])
      .then(([a, s]) => {
        setRecords(a)
        setSummary(s)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [])

  const recordColumns: Column<AttendanceRecord>[] = [
    { header: 'Date', cell: (row) => row.date },
    { header: 'Class', cell: (row) => row.class_id },
    { header: 'Status', cell: (row) => row.status },
  ]

  const summaryColumns: Column<AttendanceSummary>[] = [
    { header: 'Class', cell: (row) => row.class_name },
    { header: 'Total', cell: (row) => row.total_classes },
    { header: 'Present', cell: (row) => row.present_count },
    { header: 'Absent', cell: (row) => row.absent_count },
    {
      header: 'Percentage',
      cell: (row) => `${row.attendance_percentage.toFixed(2)}%`,
    },
  ]

  return (
    <>
      <PageHeader title="My Attendance" subtitle={`Signed in as ${session?.id ?? ''}`} />
      <ErrorMessage message={error} />
      <h3>Summary</h3>
      <DataTable columns={summaryColumns} rows={summary} empty="No summary available." />
      <h3>Records</h3>
      <DataTable columns={recordColumns} rows={records} empty="No attendance records." />
    </>
  )
}
