import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../api/client'
import type { ClassItem } from '../api/types'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import { Field, Input, Modal } from '../components/Form'
import { Loading } from '../components/Loading'
import { ErrorAlert, PageHeader } from '../components/UI'
import { useFeedback } from '../context/useFeedback'

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
  const { notify, confirm } = useFeedback()
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)

  const load = useCallback(() => {
    api
      .classes()
      .then((data) => {
        setClasses(data)
        setError('')
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (item: ClassItem) => {
    setEditing(item.class_id)
    setForm({
      class_name: item.class_name,
      class_pro: item.class_pro ?? '',
      room_no: item.room_no ?? '',
      schedule: item.schedule ?? '',
      staff_id: item.staff_id === null ? '' : String(item.staff_id),
    })
    setOpen(true)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    const payload = {
      class_name: form.class_name,
      class_pro: form.class_pro || null,
      room_no: form.room_no || null,
      schedule: form.schedule || null,
      staff_id: form.staff_id ? Number(form.staff_id) : null,
    }
    try {
      if (editing !== null) {
        await api.updateClass(editing, payload)
        notify('Class updated')
      } else {
        await api.createClass(payload)
        notify('Class created')
      }
      setOpen(false)
      load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item: ClassItem) => {
    const agreed = await confirm(
      'Delete class',
      `Remove ${item.class_name}? Attendance records for this class will also be deleted.`,
    )
    if (!agreed) return
    try {
      await api.deleteClass(item.class_id)
      notify('Class deleted')
      load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Delete failed', 'error')
    }
  }

  const columns: Column<ClassItem>[] = [
    { header: 'ID', cell: (row) => row.class_id },
    { header: 'Class', cell: (row) => <span className="font-semibold">{row.class_name}</span> },
    { header: 'Program', cell: (row) => row.class_pro ?? '-' },
    { header: 'Room', cell: (row) => row.room_no ?? '-' },
    { header: 'Schedule', cell: (row) => row.schedule ?? '-' },
    { header: 'Staff', cell: (row) => row.staff_id ?? '-' },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => openEdit(row)}
            title="Edit"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => void remove(row)}
            title="Delete"
            className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Classes"
        subtitle="Manage classes and staff assignments"
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Add class
          </button>
        }
      />
      <ErrorAlert message={error} />
      {loading ? <Loading /> : <DataTable columns={columns} rows={classes} getRowKey={(row) => row.class_id} />}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing !== null ? 'Edit class' : 'Add class'}
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
              form="class-form"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : editing !== null ? 'Save changes' : 'Add class'}
            </button>
          </>
        }
      >
        <form id="class-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Class name">
            <Input
              value={form.class_name}
              onChange={(event) => setForm({ ...form, class_name: event.target.value })}
              required
            />
          </Field>
          <Field label="Program">
            <Input
              value={form.class_pro}
              onChange={(event) => setForm({ ...form, class_pro: event.target.value })}
            />
          </Field>
          <Field label="Room number">
            <Input
              value={form.room_no}
              onChange={(event) => setForm({ ...form, room_no: event.target.value })}
            />
          </Field>
          <Field label="Schedule">
            <Input
              value={form.schedule}
              onChange={(event) => setForm({ ...form, schedule: event.target.value })}
            />
          </Field>
          <Field label="Staff ID" hint="Leave blank to assign yourself">
            <Input
              type="number"
              value={form.staff_id}
              onChange={(event) => setForm({ ...form, staff_id: event.target.value })}
            />
          </Field>
        </form>
      </Modal>
    </>
  )
}
