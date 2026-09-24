import { CalendarDays, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency, isOverdue } from '../lib/invoiceUtils'

function isSameMonth(dateStr, ref) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}

function pctDelta(current, previous) {
  if (!previous) return null
  return ((current - previous) / previous) * 100
}

function DeltaBadge({ value }) {
  if (value === null || Number.isNaN(value)) return null
  const up = value >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
        up ? 'bg-emerald-400/20 text-emerald-200' : 'bg-rose-400/20 text-rose-200'
      }`}
    >
      <Icon size={11} strokeWidth={2.5} />
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

export default function DashboardHero({ invoices }) {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const distinctBrands = new Set(invoices.map((inv) => inv.brand_name)).size
  const totalInvoices = invoices.length
  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0)
  const totalPending = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0)
  const overdueCount = invoices.filter(isOverdue).length

  const invoicesThisMonth = invoices.filter((inv) => isSameMonth(inv.invoice_date, now)).length
  const invoicesLastMonth = invoices.filter((inv) =>
    isSameMonth(inv.invoice_date, lastMonth),
  ).length
  const invoiceDelta = pctDelta(invoicesThisMonth, invoicesLastMonth)

  const paidThisMonth = invoices
    .filter((inv) => inv.status === 'paid' && isSameMonth(inv.paid_date, now))
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0)
  const paidLastMonth = invoices
    .filter((inv) => inv.status === 'paid' && isSameMonth(inv.paid_date, lastMonth))
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0)
  const paidDelta = pctDelta(paidThisMonth, paidLastMonth)

  const monthLabel = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  const kpis = [
    { label: 'Total Masuk', value: formatCurrency(totalPaid), delta: paidDelta },
    { label: 'Total Pending', value: formatCurrency(totalPending), delta: null },
    { label: 'Overdue', value: overdueCount, delta: null },
    { label: 'Brand Kerjasama', value: distinctBrands, delta: null },
    { label: 'Invoice Terbit', value: totalInvoices, delta: invoiceDelta },
  ]

  return (
    <div className="hero-banner overflow-hidden rounded-3xl">
      <div className="px-5 pb-16 pt-6 sm:px-8 sm:pb-20 sm:pt-8">
        <div className="flex flex-wrap items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
          <span>Overview untuk</span>
          <span className="underline decoration-white/40 decoration-2 underline-offset-4">
            {monthLabel}
          </span>
          <CalendarDays size={20} className="text-white/70" />
        </div>
        <p className="mt-2 text-sm text-white/70">Ringkasan performa invoice kamu</p>
      </div>

      <div className="mx-4 -mt-10 rounded-2xl bg-black/25 p-4 backdrop-blur-md sm:mx-8 sm:-mt-12 sm:p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="min-w-0">
              <p className="truncate text-[11px] font-medium uppercase tracking-wide text-white/60">
                {kpi.label}
              </p>
              <p className="mt-1 flex flex-wrap items-baseline gap-1.5 break-words text-base font-semibold leading-tight text-white sm:text-xl">
                {kpi.value}
                <DeltaBadge value={kpi.delta} />
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="h-4 sm:h-5" />
    </div>
  )
}
