import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { AuditEntry } from '../api/types'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import { ErrorMessage, PageHeader } from '../components/UI'

export function AuditLog() {
  const [rows, setRows] = useState<AuditEntry[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.audit()
      .then(setRows)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [])

  const columns: Column<AuditEntry>[] = [
    { header: 'ID', cell: (row) => row.log_id },
    { header: 'Staff', cell: (row) => row.staff_id ?? '-' },
    { header: 'Action', cell: (row) => row.action_type },
    { header: 'Timestamp', cell: (row) => row.action_timestamp },
  ]

  return (
    <>
      <PageHeader title="Audit Log" subtitle="Recent actions recorded by the system" />
      <ErrorMessage message={error} />
      <DataTable columns={columns} rows={rows} empty="No audit entries." />
    </>
  )
}
