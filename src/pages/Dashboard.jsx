import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import SummaryCards from '../components/SummaryCards'
import InvoiceTable from '../components/InvoiceTable'
import { isOverdue } from '../lib/invoiceUtils'

export default function Dashboard() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        {overdueCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            {overdueCount} invoice overdue
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <>
          <SummaryCards invoices={invoices} />
          <InvoiceTable invoices={invoices} onMarkPaid={handleMarkPaid} />
        </>
      )}
    </div>
  )
}
