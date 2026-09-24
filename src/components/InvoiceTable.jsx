import { useState } from 'react'
import { Check, X } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { formatCurrency, formatDate, isOverdue } from '../lib/invoiceUtils'
import { avatarStyle, initials } from '../lib/avatar'

export default function InvoiceTable({ invoices, onMarkPaid }) {
  const [sortKey, setSortKey] = useState('invoice_date')
  const [sortDir, setSortDir] = useState('desc')
  const [payingId, setPayingId] = useState(null)
  const [paidDateInput, setPaidDateInput] = useState('')

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...invoices].sort((a, b) => {
    let av = a[sortKey]
    let bv = b[sortKey]
    if (sortKey === 'total_amount') {
      av = Number(av) || 0
      bv = Number(bv) || 0
    }
    if (av === bv) return 0
    const result = av > bv ? 1 : -1
    return sortDir === 'asc' ? result : -result
  })

  const startMarkPaid = (invoice) => {
    setPayingId(invoice.id)
    setPaidDateInput(new Date().toISOString().slice(0, 10))
  }

  const confirmMarkPaid = (invoice) => {
    onMarkPaid(invoice, paidDateInput)
    setPayingId(null)
  }

  const SortHeader = ({ label, sortField }) => (
    <th
      onClick={() => toggleSort(sortField)}
      className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 hover:text-slate-600"
    >
      {label} {sortKey === sortField ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  )

  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        Gak ada invoice yang cocok.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.06]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/60">
            <tr>
              <SortHeader label="Brand" sortField="brand_name" />
              <SortHeader label="No. Invoice" sortField="invoice_number" />
              <SortHeader label="Nominal" sortField="total_amount" />
              <SortHeader label="Jatuh Tempo" sortField="due_date" />
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                Status
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sorted.map((invoice) => {
              const overdue = isOverdue(invoice)
              return (
                <tr key={invoice.id} className={overdue ? 'bg-red-50/40' : 'hover:bg-slate-50/60'}>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarStyle(invoice.brand_name)}`}
                      >
                        {initials(invoice.brand_name)}
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {invoice.brand_name}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-500">
                    {invoice.invoice_number}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-slate-900">
                    {formatCurrency(invoice.total_amount)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3.5 text-sm ${
                      overdue ? 'font-medium text-red-600' : 'text-slate-500'
                    }`}
                  >
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <StatusBadge invoice={invoice} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm">
                    {invoice.status === 'pending' &&
                      (payingId === invoice.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="date"
                            value={paidDateInput}
                            onChange={(e) => setPaidDateInput(e.target.value)}
                            className="rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                          />
                          <button
                            onClick={() => confirmMarkPaid(invoice)}
                            className="flex items-center gap-1 rounded-full bg-accent-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-accent-700"
                          >
                            <Check size={12} /> Simpan
                          </button>
                          <button
                            onClick={() => setPayingId(null)}
                            className="text-slate-400 hover:text-slate-600"
                            aria-label="Batal"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startMarkPaid(invoice)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700"
                        >
                          Tandai Lunas
                        </button>
                      ))}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
