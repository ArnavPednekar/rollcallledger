import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChartNoAxesCombined, School, Users } from 'lucide-react'
import { api } from '../api/client'
import type { AttendanceRecord, ClassItem, Student } from '../api/types'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import { Loading } from '../components/Loading'
import { ErrorAlert, PageHeader, StatusChip } from '../components/UI'

const cards = [
  { key: 'students', label: 'Students', icon: Users, gradient: 'from-indigo-500 to-indigo-600' },
  { key: 'classes', label: 'Classes', icon: School, gradient: 'from-teal-500 to-teal-600' },
  {
    key: 'records',
    label: 'Recent records',
    icon: ChartNoAxesCombined,
    gradient: 'from-amber-500 to-orange-600',
  },
] as const

export function Dashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([api.students(), api.classes(), api.attendance({ limit: 5 })])
      .then(([s, c, a]) => {
        if (!active) return
        setStudents(s)
        setClasses(c)
        setAttendance(a)
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

  const columns: Column<AttendanceRecord>[] = [
    { header: 'USN', cell: (row) => row.usn },
    { header: 'Class', cell: (row) => row.class_id },
    { header: 'Date', cell: (row) => row.date },
    { header: 'Status', cell: (row) => <StatusChip status={row.status} /> },
  ]

  const values: Record<(typeof cards)[number]['key'], number> = {
    students: students.length,
    classes: classes.length,
    records: attendance.length,
  }

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A quick look at your attendance system" />
      <ErrorAlert message={error} />
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold tracking-tight">{values[card.key]}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {card.label}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
          <h3 className="mb-3 text-lg font-bold">Recent attendance</h3>
          <DataTable columns={columns} rows={attendance} getRowKey={(row) => row.rec_id} />
        </>
      )}
    </>
  )
}
