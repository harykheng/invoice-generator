import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ListChecks, CalendarClock, Download } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import LineItemsEditor from '../components/LineItemsEditor'
import DatePicker from '../components/DatePicker'
import CustomSelect from '../components/CustomSelect'
import {
  calcTotal,
  calcTax,
  calcDueDate,
  formatCurrency,
  formatDate,
  generateInvoiceNumber,
} from '../lib/invoiceUtils'

const TOP_OPTIONS = [
  { label: 'H+7', value: 7 },
  { label: 'H+14', value: 14 },
  { label: 'H+30', value: 30 },
  { label: 'Custom', value: 'custom' },
]

const TAX_TYPE_OPTIONS = [
  { label: 'Tanpa Pajak', value: 'none' },
  { label: 'Persentase (%)', value: 'percent' },
  { label: 'Nominal Tetap', value: 'fixed' },
]

const today = () => new Date().toISOString().slice(0, 10)

const inputClass =
  'w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500'
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700'

function SectionCard({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.06] sm:p-6">
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
  const [items, setItems] = useState([{ description: '', qty: 1, unit: '', price: 0 }])
  const [topOption, setTopOption] = useState(14)
  const [customTop, setCustomTop] = useState(14)
  const [taxType, setTaxType] = useState('none')
  const [taxValue, setTaxValue] = useState(0)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const termDays = topOption === 'custom' ? Number(customTop) || 0 : Number(topOption)
  const dueDate = calcDueDate(invoiceDate, termDays)
  const subtotal = calcTotal(items)
  const taxAmount = calcTax(subtotal, taxType, taxValue)
  const total = subtotal + taxAmount

  const resetForm = () => {
    setBrandName('')
    setPtName('')
    setPtAddress('')
    setPtContact('')
    setInvoiceDate(today())
    setItems([{ description: '', qty: 1, unit: '', price: 0 }])
    setTopOption(14)
    setCustomTop(14)
    setTaxType('none')
    setTaxValue(0)
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
      const validSubtotal = calcTotal(validItems)
      const validTaxAmount = calcTax(validSubtotal, taxType, taxValue)

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
          unit: item.unit?.trim() || '',
          price: Number(item.price) || 0,
        })),
        tax_type: taxType,
        tax_value: taxType === 'none' ? 0 : Number(taxValue) || 0,
        total_amount: validSubtotal + validTaxAmount,
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

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className={labelClass}>Pajak</label>
                <CustomSelect
                  value={taxType}
                  onChange={setTaxType}
                  options={TAX_TYPE_OPTIONS}
                  className="w-44"
                />
              </div>
              {taxType !== 'none' && (
                <div>
                  <label className={labelClass}>
                    {taxType === 'percent' ? 'Persentase (%)' : 'Nominal Pajak (Rp)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={taxType === 'percent' ? '0.1' : '1'}
                    value={taxValue}
                    onChange={(e) => setTaxValue(e.target.value)}
                    className={`${inputClass} w-36`}
                  />
                </div>
              )}
            </div>

            <div className="space-y-1 text-right text-sm">
              <div className="flex justify-end gap-3 text-slate-500">
                <span>Subtotal:</span>
                <span className="w-32 tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              {taxType !== 'none' && (
                <div className="flex justify-end gap-3 text-slate-500">
                  <span>
                    Pajak{taxType === 'percent' ? ` (${taxValue || 0}%)` : ''}:
                  </span>
                  <span className="w-32 tabular-nums">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-1 font-medium text-slate-500">
                <span>Total:</span>
                <span className="w-32 tabular-nums text-base font-semibold text-slate-900">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={CalendarClock} title="Pembayaran">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Tanggal Invoice</label>
              <DatePicker value={invoiceDate} onChange={setInvoiceDate} />
            </div>
            <div>
              <label className={labelClass}>Term of Payment</label>
              <CustomSelect value={topOption} onChange={setTopOption} options={TOP_OPTIONS} />
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
              <div className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500">
                {formatDate(dueDate)}
                <CalendarClock size={16} className="shrink-0 text-slate-300" />
              </div>
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
