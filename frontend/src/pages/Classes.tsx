import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api/client'
import type { ClassItem } from '../api/types'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import { ErrorMessage, Field, FormActions, PageHeader } from '../components/UI'

interface FormState {
  class_name: string
  class_pro: string
  room_no: string
  schedule: string
  staff_id: string
}

const emptyForm: FormState = {
  class_name: '',
  class_pro: '',
  room_no: '',
  schedule: '',
  staff_id: '',
}

export function Classes() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editing, setEditing] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = () => {
    api.classes().then(setClasses).catch((err: unknown) => setError(message(err)))
  }

  useEffect(load, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const payload = {
      class_name: form.class_name,
      class_pro: form.class_pro || null,
      room_no: form.room_no || null,
      schedule: form.schedule || null,
      staff_id: form.staff_id ? Number(form.staff_id) : null,
    }
    try {
      if (editing !== null) await api.updateClass(editing, payload)
      else await api.createClass(payload)
      setForm(emptyForm)
      setEditing(null)
      load()
    } catch (err) {
      setError(message(err))
    }
  }

  const edit = (item: ClassItem) => {
    setEditing(item.class_id)
    setForm({
      class_name: item.class_name,
      class_pro: item.class_pro ?? '',
      room_no: item.room_no ?? '',
      schedule: item.schedule ?? '',
      staff_id: item.staff_id === null ? '' : String(item.staff_id),
    })
  }

  const remove = async (id: number) => {
    setError('')
    try {
      await api.deleteClass(id)
      load()
    } catch (err) {
      setError(message(err))
    }
  }

  const columns: Column<ClassItem>[] = [
    { header: 'ID', cell: (row) => row.class_id },
    { header: 'Name', cell: (row) => row.class_name },
    { header: 'Program', cell: (row) => row.class_pro ?? '-' },
    { header: 'Room', cell: (row) => row.room_no ?? '-' },
    { header: 'Schedule', cell: (row) => row.schedule ?? '-' },
    { header: 'Staff', cell: (row) => row.staff_id ?? '-' },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="row-actions">
          <button type="button" className="btn small" onClick={() => edit(row)}>
            Edit
          </button>
          <button type="button" className="btn small danger" onClick={() => void remove(row.class_id)}>
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Classes" subtitle="Manage classes and assigned staff" />
      <ErrorMessage message={error} />
      <form className="panel form-grid" onSubmit={submit}>
        <Field label="Class name">
          <input
            value={form.class_name}
            onChange={(event) => setForm({ ...form, class_name: event.target.value })}
            required
          />
        </Field>
        <Field label="Program">
          <input
            value={form.class_pro}
            onChange={(event) => setForm({ ...form, class_pro: event.target.value })}
          />
        </Field>
        <Field label="Room">
          <input
            value={form.room_no}
            onChange={(event) => setForm({ ...form, room_no: event.target.value })}
          />
        </Field>
        <Field label="Schedule">
          <input
            value={form.schedule}
            onChange={(event) => setForm({ ...form, schedule: event.target.value })}
          />
        </Field>
        <Field label="Staff ID">
          <input
            type="number"
            value={form.staff_id}
            onChange={(event) => setForm({ ...form, staff_id: event.target.value })}
          />
        </Field>
        <FormActions
          submitLabel={editing !== null ? 'Save changes' : 'Add class'}
          onCancel={
            editing !== null
              ? () => {
                  setEditing(null)
                  setForm(emptyForm)
                }
              : undefined
          }
        />
      </form>
      <DataTable columns={columns} rows={classes} empty="No classes yet." />
    </>
  )
}

function message(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong'
}
