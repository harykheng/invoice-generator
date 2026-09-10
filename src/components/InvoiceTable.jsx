import { useState } from 'react'
import StatusBadge from './StatusBadge'
import { formatCurrency, formatDate, isOverdue } from '../lib/invoiceUtils'

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
      className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hover:text-gray-700"
    >
      {label} {sortKey === sortField ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  )

  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
        Belum ada invoice. Buat invoice pertama kamu.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortHeader label="Brand" sortField="brand_name" />
              <SortHeader label="No. Invoice" sortField="invoice_number" />
              <SortHeader label="Nominal" sortField="total_amount" />
              <SortHeader label="Jatuh Tempo" sortField="due_date" />
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Status
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((invoice) => {
              const overdue = isOverdue(invoice)
              return (
                <tr
                  key={invoice.id}
                  className={overdue ? 'bg-red-50/60' : 'hover:bg-gray-50'}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                    {invoice.brand_name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {invoice.invoice_number}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {formatCurrency(invoice.total_amount)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-sm ${
                      overdue ? 'font-medium text-red-600' : 'text-gray-500'
                    }`}
                  >
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge invoice={invoice} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    {invoice.status === 'pending' &&
                      (payingId === invoice.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="date"
                            value={paidDateInput}
                            onChange={(e) => setPaidDateInput(e.target.value)}
                            className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                          />
                          <button
                            onClick={() => confirmMarkPaid(invoice)}
                            className="rounded-md bg-accent-600 px-2 py-1 text-xs font-medium text-white hover:bg-accent-700"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setPayingId(null)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startMarkPaid(invoice)}
                          className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
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
