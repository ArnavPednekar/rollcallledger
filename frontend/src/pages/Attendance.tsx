import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Filter, Plus, Trash2 } from 'lucide-react'
import { api } from '../api/client'
import type { AttendanceRecord } from '../api/types'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import { Field, Input, Modal, Select } from '../components/Form'
import { Loading } from '../components/Loading'
import { ErrorAlert, PageHeader, StatusChip } from '../components/UI'
import { useFeedback } from '../context/useFeedback'

const STATUSES = ['Present', 'Absent', 'Late', 'Excused']
const statusOptions = STATUSES.map((status) => ({ value: status, label: status }))

interface MarkForm {
  usn: string
  class_id: string
  date: string
  status: string
}

const emptyForm: MarkForm = { usn: '', class_id: '', date: '', status: 'Present' }

export function Attendance() {
  const { notify, confirm } = useFeedback()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<MarkForm>(emptyForm)
  const [filters, setFilters] = useState({ usn: '', class_id: '', date: '', status: '' })

  const load = useCallback((params: Record<string, string>) => {
    api
      .attendance(params)
      .then((data) => {
        setRecords(data)
        setError('')
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load({})
  }, [load])

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    load(filters)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    try {
      await api.markAttendance({
        usn: form.usn,
        class_id: Number(form.class_id),
        date: form.date || new Date().toISOString().slice(0, 10),
        status: form.status,
      })
      notify('Attendance saved')
      setOpen(false)
      setForm(emptyForm)
      load(filters)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (record: AttendanceRecord) => {
    const agreed = await confirm(
      'Delete record',
      `Remove the ${record.status} entry for ${record.usn} on ${record.date}?`,
    )
    if (!agreed) return
    try {
      await api.deleteAttendance(record.rec_id)
      notify('Record deleted')
      load(filters)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Delete failed', 'error')
    }
  }

  const columns: Column<AttendanceRecord>[] = [
    { header: 'ID', cell: (row) => row.rec_id },
    { header: 'USN', cell: (row) => <span className="font-semibold">{row.usn}</span> },
    { header: 'Class', cell: (row) => row.class_id },
    { header: 'Date', cell: (row) => row.date },
    { header: 'Status', cell: (row) => <StatusChip status={row.status} /> },
    {
      header: '',
      cell: (row) => (
        <button
          type="button"
          onClick={() => void remove(row)}
          title="Delete"
          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Attendance"
        subtitle="Mark attendance and filter records"
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Mark attendance
          </button>
        }
      />
      <ErrorAlert message={error} />

      <form
        onSubmit={applyFilters}
        className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="USN">
            <Input
              value={filters.usn}
              onChange={(event) => setFilters({ ...filters, usn: event.target.value })}
            />
          </Field>
          <Field label="Class ID">
            <Input
              value={filters.class_id}
              onChange={(event) => setFilters({ ...filters, class_id: event.target.value })}
            />
          </Field>
          <Field label="Date">
            <Input
              type="date"
              value={filters.date}
              onChange={(event) => setFilters({ ...filters, date: event.target.value })}
            />
          </Field>
          <Field label="Status">
            <Select
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              options={[{ value: '', label: 'All' }, ...statusOptions]}
            />
          </Field>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Apply
            </button>
          </div>
        </div>
      </form>

      {loading ? <Loading /> : <DataTable columns={columns} rows={records} getRowKey={(row) => row.rec_id} />}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Mark attendance"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="attendance-form"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save attendance'}
            </button>
          </>
        }
      >
        <form id="attendance-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="USN">
            <Input
              value={form.usn}
              onChange={(event) => setForm({ ...form, usn: event.target.value })}
              required
            />
          </Field>
          <Field label="Class ID">
            <Input
              type="number"
              value={form.class_id}
              onChange={(event) => setForm({ ...form, class_id: event.target.value })}
              required
            />
          </Field>
          <Field label="Date">
            <Input
              type="date"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              options={statusOptions}
            />
          </Field>
        </form>
      </Modal>
    </>
  )
}
