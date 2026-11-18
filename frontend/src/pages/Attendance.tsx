import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api/client'
import type { AttendanceRecord } from '../api/types'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import { ErrorMessage, Field, FormActions, PageHeader } from '../components/UI'

const STATUSES = ['Present', 'Absent', 'Late', 'Excused']

interface MarkForm {
  usn: string
  class_id: string
  date: string
  status: string
}

export function Attendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [error, setError] = useState('')
  const [filterUsn, setFilterUsn] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState<MarkForm>({
    usn: '',
    class_id: '',
    date: '',
    status: 'Present',
  })

  const load = (params: Record<string, string>) => {
    api.attendance(params)
      .then(setRecords)
      .catch((err: unknown) => setError(message(err)))
  }

  useEffect(() => {
    load({})
  }, [])

  const applyFilter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    load({ usn: filterUsn, class_id: filterClass, date: filterDate, status: filterStatus })
  }

  const mark = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    try {
      await api.markAttendance({
        usn: form.usn,
        class_id: Number(form.class_id),
        date: form.date || new Date().toISOString().slice(0, 10),
        status: form.status,
      })
      load({ usn: filterUsn, class_id: filterClass, date: filterDate, status: filterStatus })
    } catch (err) {
      setError(message(err))
    }
  }

  const remove = async (id: number) => {
    setError('')
    try {
      await api.deleteAttendance(id)
      load({ usn: filterUsn, class_id: filterClass, date: filterDate, status: filterStatus })
    } catch (err) {
      setError(message(err))
    }
  }

  const columns: Column<AttendanceRecord>[] = [
    { header: 'ID', cell: (row) => row.rec_id },
    { header: 'USN', cell: (row) => row.usn },
    { header: 'Class', cell: (row) => row.class_id },
    { header: 'Date', cell: (row) => row.date },
    { header: 'Status', cell: (row) => row.status },
    {
      header: '',
      cell: (row) => (
        <button type="button" className="btn small danger" onClick={() => void remove(row.rec_id)}>
          Delete
        </button>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Attendance" subtitle="Mark and filter attendance records" />
      <ErrorMessage message={error} />

      <form className="panel form-grid" onSubmit={mark}>
        <Field label="USN">
          <input
            value={form.usn}
            onChange={(event) => setForm({ ...form, usn: event.target.value })}
            required
          />
        </Field>
        <Field label="Class ID">
          <input
            type="number"
            value={form.class_id}
            onChange={(event) => setForm({ ...form, class_id: event.target.value })}
            required
          />
        </Field>
        <Field label="Date">
          <input
            type="date"
            value={form.date}
            onChange={(event) => setForm({ ...form, date: event.target.value })}
          />
        </Field>
        <Field label="Status">
          <select
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            {STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </Field>
        <FormActions submitLabel="Mark attendance" />
      </form>

      <form className="panel form-grid filters" onSubmit={applyFilter}>
        <Field label="Filter USN">
          <input value={filterUsn} onChange={(event) => setFilterUsn(event.target.value)} />
        </Field>
        <Field label="Filter class">
          <input value={filterClass} onChange={(event) => setFilterClass(event.target.value)} />
        </Field>
        <Field label="Filter date">
          <input type="date" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} />
        </Field>
        <Field label="Filter status">
          <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
            <option value="">All</option>
            {STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </Field>
        <FormActions submitLabel="Apply filters" />
      </form>

      <DataTable columns={columns} rows={records} empty="No attendance records found." />
    </>
  )
}

function message(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong'
}
