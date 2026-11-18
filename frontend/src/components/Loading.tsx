import { LoaderCircle } from 'lucide-react'

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="grid min-h-56 place-items-center">
      <div className="text-center">
        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  )
}
