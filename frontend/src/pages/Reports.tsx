import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { AttendanceSummary } from '../api/types'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import { ErrorMessage, PageHeader } from '../components/UI'

export function Reports() {
  const [rows, setRows] = useState<AttendanceSummary[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.reports()
      .then(setRows)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [])

  const columns: Column<AttendanceSummary>[] = [
    { header: 'USN', cell: (row) => row.usn },
    { header: 'Student', cell: (row) => row.student_name },
    { header: 'Class', cell: (row) => row.class_name },
    { header: 'Total', cell: (row) => row.total_classes },
    { header: 'Present', cell: (row) => row.present_count },
    { header: 'Absent', cell: (row) => row.absent_count },
    { header: 'Late', cell: (row) => row.late_count },
    {
      header: 'Percentage',
      cell: (row) => `${row.attendance_percentage.toFixed(2)}%`,
    },
  ]

  return (
    <>
      <PageHeader title="Reports" subtitle="Attendance summary per student and class" />
      <ErrorMessage message={error} />
      <DataTable columns={columns} rows={rows} empty="No summary available." />
    </>
  )
}
