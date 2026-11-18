import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { AttendanceSummary } from '../api/types'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import { Loading } from '../components/Loading'
import { ErrorAlert, PageHeader } from '../components/UI'

export function Reports() {
  const [rows, setRows] = useState<AttendanceSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api
      .reports()
      .then((data) => {
        if (active) setRows(data)
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const columns: Column<AttendanceSummary>[] = [
    { header: 'USN', cell: (row) => <span className="font-semibold">{row.usn}</span> },
    { header: 'Student', cell: (row) => row.student_name },
    { header: 'Class', cell: (row) => row.class_name },
    { header: 'Total', cell: (row) => row.total_classes },
    { header: 'Present', cell: (row) => row.present_count },
    { header: 'Absent', cell: (row) => row.absent_count },
    { header: 'Late', cell: (row) => row.late_count },
    {
      header: 'Attendance',
      cell: (row) => {
        const value = Math.max(0, Math.min(100, row.attendance_percentage))
        return (
          <div className="min-w-36">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold">{value.toFixed(2)}%</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  value >= 75
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                }`}
              >
                {value >= 75 ? 'Good' : 'Low'}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full ${value >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader title="Reports" subtitle="Attendance summary by student and class" />
      <ErrorAlert message={error} />
      {loading ? (
        <Loading />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(row) => `${row.usn}-${row.class_id}`}
        />
      )}
    </>
  )
}
