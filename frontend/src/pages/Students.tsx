import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api/client'
import type { Student } from '../api/types'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import { ErrorMessage, Field, FormActions, PageHeader } from '../components/UI'

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

export function Students() {
  const [students, setStudents] = useState<Student[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    api.students().then(setStudents).catch((err: unknown) => setError(message(err)))
  }

  useEffect(load, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    try {
      const payload = {
        s_name: form.s_name,
        password: form.password || null,
        sem: form.sem ? Number(form.sem) : null,
        ph_no: form.ph_no || null,
        emailid: form.emailid,
      }
      if (editing) await api.updateStudent(form.usn, payload)
      else
        await api.createStudent({
          usn: form.usn,
          s_name: form.s_name,
          password: form.password,
          sem: payload.sem,
          ph_no: payload.ph_no,
          emailid: form.emailid,
        })
      setForm(emptyForm)
      setEditing(false)
      load()
    } catch (err) {
      setError(message(err))
    }
  }

  const edit = (student: Student) => {
    setEditing(true)
    setForm({
      usn: student.usn,
      s_name: student.s_name,
      password: '',
      sem: student.sem === null ? '' : String(student.sem),
      ph_no: student.ph_no ?? '',
      emailid: student.emailid,
    })
  }

  const remove = async (usn: string) => {
    setError('')
    try {
      await api.deleteStudent(usn)
      load()
    } catch (err) {
      setError(message(err))
    }
  }

  const columns: Column<Student>[] = [
    { header: 'USN', cell: (row) => row.usn },
    { header: 'Name', cell: (row) => row.s_name },
    { header: 'Sem', cell: (row) => row.sem ?? '-' },
    { header: 'Email', cell: (row) => row.emailid },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="row-actions">
          <button type="button" className="btn small" onClick={() => edit(row)}>
            Edit
          </button>
          <button type="button" className="btn small danger" onClick={() => void remove(row.usn)}>
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Students" subtitle="Add, edit and remove students" />
      <ErrorMessage message={error} />
      <form className="panel form-grid" onSubmit={submit}>
        <Field label="USN">
          <input
            value={form.usn}
            disabled={editing}
            onChange={(event) => setForm({ ...form, usn: event.target.value })}
            required
          />
        </Field>
        <Field label="Name">
          <input
            value={form.s_name}
            onChange={(event) => setForm({ ...form, s_name: event.target.value })}
            required
          />
        </Field>
        <Field label={editing ? 'New password (optional)' : 'Password'}>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required={!editing}
          />
        </Field>
        <Field label="Semester">
          <input
            type="number"
            min="1"
            max="8"
            value={form.sem}
            onChange={(event) => setForm({ ...form, sem: event.target.value })}
          />
        </Field>
        <Field label="Phone">
          <input
            value={form.ph_no}
            onChange={(event) => setForm({ ...form, ph_no: event.target.value })}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={form.emailid}
            onChange={(event) => setForm({ ...form, emailid: event.target.value })}
            required
          />
        </Field>
        <FormActions
          submitLabel={editing ? 'Save changes' : 'Add student'}
          onCancel={
            editing
              ? () => {
                  setEditing(false)
                  setForm(emptyForm)
                }
              : undefined
          }
        />
      </form>
      <DataTable columns={columns} rows={students} empty="No students yet." />
    </>
  )
}

function message(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong'
}
