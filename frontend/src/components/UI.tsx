import type { FormEvent, ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <header className="page-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

export function ErrorMessage({ message }: { message: string }) {
  return message ? <p className="error">{message}</p> : null
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}

export function FormActions({
  submitLabel,
  onCancel,
}: {
  submitLabel: string
  onCancel?: () => void
}) {
  return (
    <div className="form-actions">
      <button type="submit" className="btn primary">
        {submitLabel}
      </button>
      {onCancel && (
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      )}
    </div>
  )
}

export function SubmitForm({
  onSubmit,
  children,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  children: ReactNode
}) {
  return <form onSubmit={onSubmit}>{children}</form>
}
