import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, AlertTriangle, ArrowRight, FilePlus2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import DashboardHero from '../components/DashboardHero'
import RecentInvoices from '../components/RecentInvoices'
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
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <>
          <DashboardHero invoices={invoices} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentInvoices invoices={invoices} />
            </div>
            <div className="flex flex-col gap-4">
              <InvoiceStatusOverview invoices={invoices} />
              <Link
                to="/new"
                className="flex flex-1 flex-col justify-between rounded-2xl bg-neutral-950 p-5 text-white transition-colors hover:bg-neutral-900"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-900">
                  <ArrowRight size={16} strokeWidth={2.5} />
                </div>
                <div className="mt-6 flex items-center gap-2 text-base font-semibold">
                  <FilePlus2 size={18} />
                  Buat Invoice Baru
                </div>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Semua Invoice</h2>
              {overdueCount > 0 && (
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                  <AlertTriangle size={12} />
                  {overdueCount} invoice overdue
                </span>
              )}
            </div>
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

          <InvoiceTable invoices={filteredInvoices} onMarkPaid={handleMarkPaid} />
        </>
      )}
    </div>
  )
}
