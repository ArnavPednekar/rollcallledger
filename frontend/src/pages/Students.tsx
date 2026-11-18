import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../api/client'
import type { Student } from '../api/types'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import { Field, Input, Modal, Select } from '../components/Form'
import { Loading } from '../components/Loading'
import { ErrorAlert, PageHeader } from '../components/UI'
import { useFeedback } from '../context/useFeedback'

interface FormState {
  usn: string
  s_name: string
  password: string
  sem: string
  ph_no: string
  emailid: string
}

const emptyForm: FormState = {
  usn: '',
  s_name: '',
  password: '',
  sem: '',
  ph_no: '',
  emailid: '',
}

const semesters = Array.from({ length: 8 }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1),
}))

export function Students() {
  const { notify, confirm } = useFeedback()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)

  const load = useCallback(() => {
    api
      .students()
      .then((data) => {
        setStudents(data)
        setError('')
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(false)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (student: Student) => {
    setEditing(true)
    setForm({
      usn: student.usn,
      s_name: student.s_name,
      password: '',
      sem: student.sem === null ? '' : String(student.sem),
      ph_no: student.ph_no ?? '',
      emailid: student.emailid,
    })
    setOpen(true)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    try {
      const shared = {
        s_name: form.s_name,
        sem: form.sem ? Number(form.sem) : null,
        ph_no: form.ph_no || null,
        emailid: form.emailid,
      }
      if (editing) {
        await api.updateStudent(form.usn, { ...shared, password: form.password || null })
        notify('Student updated successfully')
      } else {
        await api.createStudent({ ...shared, usn: form.usn, password: form.password })
        notify('Student added successfully')
      }
      setOpen(false)
      load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (student: Student) => {
    const agreed = await confirm(
      'Delete student',
      `This will permanently remove ${student.s_name} (${student.usn}) and their attendance records.`,
    )
    if (!agreed) return
    try {
      await api.deleteStudent(student.usn)
      notify('Student deleted')
      load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Delete failed', 'error')
    }
  }

  const columns: Column<Student>[] = [
    { header: 'USN', cell: (row) => <span className="font-semibold">{row.usn}</span> },
    { header: 'Name', cell: (row) => row.s_name },
    { header: 'Semester', cell: (row) => row.sem ?? '-' },
    { header: 'Email', cell: (row) => row.emailid },
    { header: 'Phone', cell: (row) => row.ph_no ?? '-' },
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
        title="Students"
        subtitle="Manage student records"
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Add student
          </button>
        }
      />
      <ErrorAlert message={error} />
      {loading ? <Loading /> : <DataTable columns={columns} rows={students} getRowKey={(row) => row.usn} />}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit student' : 'Add student'}
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
              form="student-form"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add student'}
            </button>
          </>
        }
      >
        <form id="student-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="USN">
            <Input
              value={form.usn}
              disabled={editing}
              onChange={(event) => setForm({ ...form, usn: event.target.value })}
              required
            />
          </Field>
          <Field label="Full name">
            <Input
              value={form.s_name}
              onChange={(event) => setForm({ ...form, s_name: event.target.value })}
              required
            />
          </Field>
          <Field
            label={editing ? 'New password (optional)' : 'Password'}
            hint="At least 8 characters"
          >
            <Input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required={!editing}
            />
          </Field>
          <Field label="Semester">
            <Select
              value={form.sem}
              onChange={(event) => setForm({ ...form, sem: event.target.value })}
              options={[{ value: '', label: 'Select' }, ...semesters]}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={form.ph_no}
              onChange={(event) => setForm({ ...form, ph_no: event.target.value })}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={form.emailid}
              onChange={(event) => setForm({ ...form, emailid: event.target.value })}
              required
            />
          </Field>
        </form>
      </Modal>
    </>
  )
}
