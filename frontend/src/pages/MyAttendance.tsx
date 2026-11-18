import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../api/client'
import type { AttendanceRecord, AttendanceSummary } from '../api/types'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import { Loading } from '../components/Loading'
import { ErrorAlert, PageHeader, StatusChip } from '../components/UI'
import { useAuth } from '../context/useAuth'

export function MyAttendance() {
  const { session } = useAuth()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [summary, setSummary] = useState<AttendanceSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([api.myAttendance(), api.mySummary()])
      .then(([a, s]) => {
        if (!active) return
        setRecords(a)
        setSummary(s)
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

  const recordColumns: Column<AttendanceRecord>[] = [
    { header: 'Date', cell: (row) => row.date },
    { header: 'Class', cell: (row) => row.class_id },
    { header: 'Status', cell: (row) => <StatusChip status={row.status} /> },
  ]

  const summaryColumns: Column<AttendanceSummary>[] = [
    { header: 'Class', cell: (row) => row.class_name },
    { header: 'Total', cell: (row) => row.total_classes },
    { header: 'Present', cell: (row) => row.present_count },
    { header: 'Absent', cell: (row) => row.absent_count },
    {
      header: 'Attendance',
      cell: (row) => {
        const value = Math.max(0, Math.min(100, row.attendance_percentage))
        return (
          <div className="min-w-32">
            <span className="text-xs font-semibold">{value.toFixed(2)}%</span>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-400" style={{ width: `${value}%` }} />
            </div>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader title="My Attendance" subtitle={`Signed in as ${session?.id ?? ''}`} />
      <ErrorAlert message={error} />
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summary.map((item, index) => {
              const value = Math.max(0, Math.min(100, item.attendance_percentage))
              return (
                <motion.div
                  key={item.class_id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.07 }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="text-sm font-bold">{item.class_name}</p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight">{value.toFixed(1)}%</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-400"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {item.present_count} present · {item.absent_count} absent
                  </p>
                </motion.div>
              )
            })}
          </div>
          <h3 className="mb-3 text-lg font-bold">Attendance records</h3>
          <DataTable columns={recordColumns} rows={records} getRowKey={(row) => row.rec_id} />
          <h3 className="mb-3 mt-6 text-lg font-bold">Class summary</h3>
          <DataTable columns={summaryColumns} rows={summary} getRowKey={(row) => row.class_id} />
        </>
      )}
    </>
  )
}
