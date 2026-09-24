import { Building2, FileStack, Wallet, Clock3 } from 'lucide-react'
import { formatCurrency } from '../lib/invoiceUtils'

const TILE_STYLES = {
  blue: 'bg-blue-50 text-blue-600',
  violet: 'bg-accent-50 text-accent-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
}

export default function SummaryCards({ invoices }) {
  const distinctBrands = new Set(invoices.map((inv) => inv.brand_name)).size
  const totalInvoices = invoices.length
  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0)
  const totalPending = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0)

  const cards = [
    { label: 'Brand Kerjasama', value: distinctBrands, icon: Building2, tone: 'blue' },
    { label: 'Invoice Terbit', value: totalInvoices, icon: FileStack, tone: 'violet' },
    { label: 'Total Masuk', value: formatCurrency(totalPaid), icon: Wallet, tone: 'green' },
    { label: 'Total Pending', value: formatCurrency(totalPending), icon: Clock3, tone: 'amber' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-5"
        >
          <div
            className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${TILE_STYLES[card.tone]}`}
          >
            <card.icon size={18} strokeWidth={2} />
          </div>
          <p className="text-xs font-medium text-slate-500">{card.label}</p>
          <p className="mt-1 break-words text-base font-semibold leading-tight text-slate-900 sm:text-xl">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}
