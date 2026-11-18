import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { AuditEntry } from '../api/types'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import { Loading } from '../components/Loading'
import { ErrorAlert, PageHeader } from '../components/UI'

function colorFor(action: string) {
  if (action.includes('DELETE')) return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
  if (action.includes('INSERT') || action.includes('CREATE') || action === 'LOGIN') {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
  }
  if (action.includes('UPDATE')) return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
  return 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'
}

export function AuditLog() {
  const [rows, setRows] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api
      .audit()
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

  const columns: Column<AuditEntry>[] = [
    { header: 'ID', cell: (row) => row.log_id },
    { header: 'Staff', cell: (row) => row.staff_id ?? 'System' },
    {
      header: 'Action',
      cell: (row) => (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorFor(row.action_type)}`}>
          {row.action_type}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      cell: (row) => new Date(row.action_timestamp).toLocaleString(),
    },
  ]

  return (
    <>
      <PageHeader title="Audit Log" subtitle="Recent system activity" />
      <ErrorAlert message={error} />
      {loading ? <Loading /> : <DataTable columns={columns} rows={rows} getRowKey={(row) => row.log_id} />}
    </>
  )
}
