import { isOverdue } from '../lib/invoiceUtils'

export default function StatusBadge({ invoice }) {
  if (invoice.status === 'paid') {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
        Paid
      </span>
    )
  }

  if (isOverdue(invoice)) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        Overdue
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
      Pending
    </span>
  )
}
