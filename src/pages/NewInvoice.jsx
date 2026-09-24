import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ListChecks, CalendarClock, Download } from 'lucide-react'
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

const inputClass =
  'w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500'
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700'

function SectionCard({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
          <Icon size={16} strokeWidth={2.25} />
        </div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  )
}

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
      <div className="mb-6">
        <p className="text-sm text-slate-500">Bikin tagihan buat brand kerjasama</p>
        <h1 className="text-2xl font-semibold text-slate-900">Invoice Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard icon={Building2} title="Info Brand">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Brand Name *</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Nama PT</label>
              <input
                type="text"
                value={ptName}
                onChange={(e) => setPtName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Alamat PT</label>
              <input
                type="text"
                value={ptAddress}
                onChange={(e) => setPtAddress(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Kontak (email/no. HP)</label>
              <input
                type="text"
                value={ptContact}
                onChange={(e) => setPtContact(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={ListChecks} title="Rate Card / Item">
          <LineItemsEditor items={items} onChange={setItems} />
          <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
            <span className="text-sm font-medium text-slate-500">
              Total:&nbsp;
              <span className="text-base font-semibold text-slate-900">
                {formatCurrency(total)}
              </span>
            </span>
          </div>
        </SectionCard>

        <SectionCard icon={CalendarClock} title="Pembayaran">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Tanggal Invoice</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Term of Payment</label>
              <select
                value={topOption}
                onChange={(e) =>
                  setTopOption(
                    e.target.value === 'custom' ? 'custom' : Number(e.target.value),
                  )
                }
                className={inputClass}
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
                  className={`${inputClass} mt-2`}
                />
              )}
            </div>
            <div>
              <label className={labelClass}>Jatuh Tempo</label>
              <input
                type="text"
                readOnly
                value={dueDate}
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Catatan (opsional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>
        </SectionCard>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-full bg-accent-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-accent-600/30 hover:bg-accent-700 disabled:opacity-60"
          >
            <Download size={16} />
            {submitting ? 'Generating...' : 'Generate PDF & Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}
