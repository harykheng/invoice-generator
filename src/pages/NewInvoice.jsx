import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import LineItemsEditor from '../components/LineItemsEditor'
import {
  calcTotal,
  calcDueDate,
  formatCurrency,
  generateInvoiceNumber,
} from '../lib/invoiceUtils'

const TOP_OPTIONS = [
  { label: 'H+7', value: 7 },
  { label: 'H+14', value: 14 },
  { label: 'H+30', value: 30 },
  { label: 'Custom', value: 'custom' },
]

const today = () => new Date().toISOString().slice(0, 10)

export default function NewInvoice() {
  const navigate = useNavigate()
  const [brandName, setBrandName] = useState('')
  const [ptName, setPtName] = useState('')
  const [ptAddress, setPtAddress] = useState('')
  const [ptContact, setPtContact] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(today())
  const [items, setItems] = useState([{ description: '', qty: 1, price: 0 }])
  const [topOption, setTopOption] = useState(14)
  const [customTop, setCustomTop] = useState(14)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const termDays = topOption === 'custom' ? Number(customTop) || 0 : Number(topOption)
  const dueDate = calcDueDate(invoiceDate, termDays)
  const total = calcTotal(items)

  const resetForm = () => {
    setBrandName('')
    setPtName('')
    setPtAddress('')
    setPtContact('')
    setInvoiceDate(today())
    setItems([{ description: '', qty: 1, price: 0 }])
    setTopOption(14)
    setCustomTop(14)
    setNotes('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!brandName.trim()) {
      setError('Brand name wajib diisi.')
      return
    }
    const validItems = items.filter((item) => item.description.trim())
    if (validItems.length === 0) {
      setError('Tambahkan minimal 1 item dengan deskripsi.')
      return
    }

    setSubmitting(true)
    try {
      const invoiceNumber = await generateInvoiceNumber(invoiceDate)

      const invoiceRecord = {
        brand_name: brandName.trim(),
        pt_name: ptName.trim(),
        pt_address: ptAddress.trim(),
        pt_contact: ptContact.trim(),
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        items: validItems.map((item) => ({
          description: item.description,
          qty: Number(item.qty) || 0,
          price: Number(item.price) || 0,
        })),
        total_amount: calcTotal(validItems),
        payment_term_days: termDays,
        due_date: dueDate,
        status: 'pending',
        notes: notes.trim() || null,
      }

      const { data, error: insertError } = await supabase
        .from('invoices')
        .insert(invoiceRecord)
        .select()
        .single()

      if (insertError) throw insertError

      const [{ pdf }, { default: InvoicePdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../lib/InvoicePdf'),
      ])
      const blob = await pdf(<InvoicePdf invoice={data} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${data.invoice_number}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      resetForm()
      navigate('/')
    } catch (err) {
      setError(err.message || 'Gagal membuat invoice.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Invoice Baru</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Info Brand</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Brand Name *
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nama PT
              </label>
              <input
                type="text"
                value={ptName}
                onChange={(e) => setPtName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Alamat PT
              </label>
              <input
                type="text"
                value={ptAddress}
                onChange={(e) => setPtAddress(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kontak (email/no. HP)
              </label>
              <input
                type="text"
                value={ptContact}
                onChange={(e) => setPtContact(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Rate Card / Item</h2>
          <LineItemsEditor items={items} onChange={setItems} />
          <div className="mt-4 flex justify-end border-t border-gray-100 pt-4">
            <span className="text-sm font-medium text-gray-500">
              Total:&nbsp;
              <span className="text-base font-semibold text-gray-900">
                {formatCurrency(total)}
              </span>
            </span>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Pembayaran</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tanggal Invoice
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Term of Payment
              </label>
              <select
                value={topOption}
                onChange={(e) =>
                  setTopOption(
                    e.target.value === 'custom' ? 'custom' : Number(e.target.value),
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              >
                {TOP_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {topOption === 'custom' && (
                <input
                  type="number"
                  min="0"
                  value={customTop}
                  onChange={(e) => setCustomTop(e.target.value)}
                  placeholder="Jumlah hari"
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Jatuh Tempo
              </label>
              <input
                type="text"
                readOnly
                value={dueDate}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Catatan (opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </div>
        </section>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-accent-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60"
          >
            {submitting ? 'Generating...' : 'Generate PDF & Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}
