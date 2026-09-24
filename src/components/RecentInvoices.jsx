import StatusBadge from './StatusBadge'
import { formatCurrency } from '../lib/invoiceUtils'
import { avatarStyle, initials } from '../lib/avatar'

export default function RecentInvoices({ invoices }) {
  const recent = [...invoices]
    .sort((a, b) => (a.invoice_date < b.invoice_date ? 1 : -1))
    .slice(0, 5)

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.06] sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Invoice Terbaru</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
          {invoices.length}
        </span>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-6 text-center text-sm text-slate-400">
          Belum ada invoice.
        </div>
      ) : (
        <div className="flex-1 divide-y divide-slate-50">
          {recent.map((invoice) => (
            <div key={invoice.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarStyle(invoice.brand_name)}`}
              >
                {initials(invoice.brand_name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {invoice.brand_name}
                </p>
                <p className="truncate text-xs text-slate-400">{invoice.invoice_number}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium text-slate-900">
                  {formatCurrency(invoice.total_amount)}
                </p>
                <div className="mt-0.5 flex justify-end">
                  <StatusBadge invoice={invoice} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
