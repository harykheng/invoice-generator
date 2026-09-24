import { formatCurrency } from '../lib/invoiceUtils'

export default function LineItemsEditor({ items, onChange }) {
  const updateItem = (idx, field, value) => {
    const next = items.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    onChange(next)
  }

  const addItem = () => {
    onChange([...items, { description: '', qty: 1, price: 0 }])
  }

  const removeItem = (idx) => {
    onChange(items.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div className="hidden gap-3 px-1 text-xs font-medium text-gray-500 sm:grid sm:grid-cols-[1fr,80px,140px,140px,32px]">
        <span>Deskripsi</span>
        <span>Qty</span>
        <span>Harga</span>
        <span>Subtotal</span>
        <span></span>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => {
          const subtotal = (Number(item.qty) || 0) * (Number(item.price) || 0)
          return (
            <div
              key={idx}
              className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-[1fr,80px,140px,140px,32px] sm:items-center sm:border-0 sm:p-0"
            >
              <input
                type="text"
                placeholder="Deskripsi item"
                value={item.description}
                onChange={(e) => updateItem(idx, 'description', e.target.value)}
                className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 sm:col-span-1"
              />
              <input
                type="number"
                min="0"
                placeholder="Qty"
                value={item.qty}
                onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
              <input
                type="number"
                min="0"
                placeholder="Harga"
                value={item.price}
                onChange={(e) => updateItem(idx, 'price', e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
              <span className="text-sm text-gray-600">{formatCurrency(subtotal)}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                disabled={items.length === 1}
                className="justify-self-start text-gray-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 sm:justify-self-center"
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-3 text-sm font-medium text-accent-600 hover:text-accent-700"
      >
        + Tambah item
      </button>
    </div>
  )
}
