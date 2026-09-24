import { useEffect, useMemo, useState } from 'react'
import { Search, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import SummaryCards from '../components/SummaryCards'
import InvoiceStatusOverview from '../components/InvoiceStatusOverview'
import InvoiceTable from '../components/InvoiceTable'
import { isOverdue } from '../lib/invoiceUtils'

export default function Dashboard() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const fetchInvoices = async () => {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .order('invoice_date', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setInvoices(data)
      setError('')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const overdueCount = useMemo(() => invoices.filter(isOverdue).length, [invoices])

  const filteredInvoices = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return invoices
    return invoices.filter(
      (inv) =>
        inv.brand_name?.toLowerCase().includes(q) ||
        inv.invoice_number?.toLowerCase().includes(q) ||
        inv.pt_name?.toLowerCase().includes(q),
    )
  }, [invoices, query])

  const handleMarkPaid = async (invoice, paidDate) => {
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ status: 'paid', paid_date: paidDate })
      .eq('id', invoice.id)

    if (updateError) {
      setError(updateError.message)
      return
    }
    fetchInvoices()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Kelola &amp; lacak invoice kamu</p>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          {overdueCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">
              <AlertTriangle size={14} />
              {overdueCount} invoice overdue
            </span>
          )}
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari brand / no. invoice..."
              className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 sm:w-64"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <>
          <SummaryCards invoices={invoices} />
          <InvoiceStatusOverview invoices={invoices} />
          <InvoiceTable invoices={filteredInvoices} onMarkPaid={handleMarkPaid} />
        </>
      )}
    </div>
  )
}
