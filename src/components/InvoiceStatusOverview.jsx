import { formatCurrency, isOverdue } from '../lib/invoiceUtils'

const ROWS = [
  { key: 'overdue', label: 'Overdue', dot: 'bg-red-500', track: 'bg-red-100', fill: 'bg-red-500' },
  {
    key: 'pending',
    label: 'Belum Jatuh Tempo',
    dot: 'bg-amber-500',
    track: 'bg-amber-100',
    fill: 'bg-amber-500',
  },
  { key: 'paid', label: 'Lunas', dot: 'bg-green-500', track: 'bg-green-100', fill: 'bg-green-500' },
]

export default function InvoiceStatusOverview({ invoices }) {
  const groups = { overdue: [], pending: [], paid: [] }
  for (const invoice of invoices) {
    if (invoice.status === 'paid') groups.paid.push(invoice)
    else if (isOverdue(invoice)) groups.overdue.push(invoice)
    else groups.pending.push(invoice)
  }

  const totals = Object.fromEntries(
    Object.entries(groups).map(([key, list]) => [
      key,
      list.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0),
    ]),
  )
  const grandTotal = totals.overdue + totals.pending + totals.paid

  if (invoices.length === 0) {
    return null
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
      <h2 className="mb-5 text-sm font-semibold text-slate-900">Ringkasan Status Invoice</h2>
      <div className="space-y-4">
        {ROWS.map((row) => {
          const count = groups[row.key].length
          const amount = totals[row.key]
          const pct = grandTotal > 0 ? (amount / grandTotal) * 100 : 0
          return (
            <div key={row.key}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className={`h-2 w-2 rounded-full ${row.dot}`} />
                  {row.label}
                </span>
                <span className="whitespace-nowrap text-slate-500">
                  {count} invoice · {formatCurrency(amount)}
                </span>
              </div>
              <div className={`h-2.5 overflow-hidden rounded-full ${row.track}`}>
                <div
                  className={`h-full rounded-full ${row.fill} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
