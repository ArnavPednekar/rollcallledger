import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'

export interface Column<T> {
  header: string
  cell: (row: T) => ReactNode
}

export function DataTable<T>({
  columns,
  rows,
  empty = 'No records found.',
  getRowKey,
}: {
  columns: Column<T>[]
  rows: T[]
  empty?: string
  getRowKey?: (row: T) => string | number
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <Inbox className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{empty}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column.header} className="whitespace-nowrap px-4 py-3 font-bold">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row, index) => (
              <motion.tr
                key={getRowKey ? getRowKey(row) : index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: Math.min(index * 0.025, 0.3) }}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                {columns.map((column) => (
                  <td key={column.header} className="whitespace-nowrap px-4 py-3">
                    {column.cell(row)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-100 px-4 py-2 dark:border-slate-800">
        <p className="text-[11px] text-slate-400">
          {rows.length} record{rows.length === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  )
}
