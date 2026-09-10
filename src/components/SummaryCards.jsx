import { formatCurrency } from '../lib/invoiceUtils'

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
    { label: 'Brand Kerjasama', value: distinctBrands },
    { label: 'Invoice Terbit', value: totalInvoices },
    { label: 'Total Masuk', value: formatCurrency(totalPaid), accent: 'text-green-600' },
    { label: 'Total Pending', value: formatCurrency(totalPending), accent: 'text-amber-600' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-medium text-gray-500">{card.label}</p>
          <p className={`mt-1 text-xl font-semibold ${card.accent ?? 'text-gray-900'}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}
