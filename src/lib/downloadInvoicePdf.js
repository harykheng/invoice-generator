export async function downloadInvoicePdf(invoice) {
  const [{ pdf }, { default: InvoicePdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./InvoicePdf'),
  ])
  const blob = await pdf(InvoicePdf({ invoice })).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${invoice.invoice_number}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
