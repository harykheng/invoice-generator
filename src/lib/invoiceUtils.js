import { supabase } from './supabaseClient'

export function calcTotal(items) {
  return items.reduce((sum, item) => {
    const qty = Number(item.qty) || 0
    const price = Number(item.price) || 0
    return sum + qty * price
  }, 0)
}

export function calcDueDate(invoiceDate, termDays) {
  const date = new Date(invoiceDate)
  date.setDate(date.getDate() + Number(termDays || 0))
  return date.toISOString().slice(0, 10)
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function isOverdue(invoice) {
  if (invoice.status !== 'pending') return false
  const today = new Date().toISOString().slice(0, 10)
  return invoice.due_date < today
}

// Generates INV-YYYYMM-XXX, sequential per month, based on existing rows.
export async function generateInvoiceNumber(invoiceDate) {
  const date = new Date(invoiceDate)
  const yyyymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  const prefix = `INV-${yyyymm}-`

  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1)

  if (error) throw error

  let nextSeq = 1
  if (data && data.length > 0) {
    const lastNumber = data[0].invoice_number
    const lastSeq = parseInt(lastNumber.split('-')[2], 10)
    if (!Number.isNaN(lastSeq)) nextSeq = lastSeq + 1
  }

  return `${prefix}${String(nextSeq).padStart(3, '0')}`
}
