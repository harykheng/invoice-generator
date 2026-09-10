import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { businessConfig } from '../config/business'
import { formatCurrency, formatDate } from './invoiceUtils'

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2937',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  issuerName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  muted: {
    color: '#6b7280',
    lineHeight: 1.5,
  },
  invoiceTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  metaLabel: {
    color: '#6b7280',
    textAlign: 'right',
  },
  metaValue: {
    textAlign: 'right',
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 9,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  billToName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    marginBottom: 2,
  },
  table: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  th: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#374151',
  },
  colDesc: { width: '46%' },
  colQty: { width: '12%', textAlign: 'center' },
  colPrice: { width: '20%', textAlign: 'right' },
  colSubtotal: { width: '22%', textAlign: 'right' },
  totalsBlock: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    width: 220,
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#111827',
  },
  totalLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
  },
  totalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
  },
  footer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerBox: {
    width: '48%',
  },
  notesText: {
    lineHeight: 1.5,
    color: '#374151',
  },
})

export default function InvoicePdf({ invoice }) {
  const items = invoice.items || []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.issuerName}>{businessConfig.fullName}</Text>
            <Text style={styles.muted}>{businessConfig.address}</Text>
            <Text style={styles.muted}>{businessConfig.email}</Text>
            <Text style={styles.muted}>{businessConfig.phone}</Text>
            {businessConfig.taxId ? (
              <Text style={styles.muted}>NPWP: {businessConfig.taxId}</Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.metaLabel}>No. Invoice</Text>
            <Text style={styles.metaValue}>{invoice.invoice_number}</Text>
            <Text style={styles.metaLabel}>Tanggal Invoice</Text>
            <Text style={styles.metaValue}>{formatDate(invoice.invoice_date)}</Text>
            <Text style={styles.metaLabel}>Jatuh Tempo</Text>
            <Text style={styles.metaValue}>{formatDate(invoice.due_date)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ditagihkan Kepada</Text>
          <Text style={styles.billToName}>{invoice.brand_name}</Text>
          {invoice.pt_name ? <Text style={styles.muted}>{invoice.pt_name}</Text> : null}
          {invoice.pt_address ? <Text style={styles.muted}>{invoice.pt_address}</Text> : null}
          {invoice.pt_contact ? <Text style={styles.muted}>{invoice.pt_contact}</Text> : null}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.colDesc]}>Deskripsi</Text>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colPrice]}>Harga</Text>
            <Text style={[styles.th, styles.colSubtotal]}>Subtotal</Text>
          </View>
          {items.map((item, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.qty}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.price)}</Text>
              <Text style={styles.colSubtotal}>
                {formatCurrency((Number(item.qty) || 0) * (Number(item.price) || 0))}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.total_amount)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerBox}>
            <Text style={styles.sectionLabel}>Pembayaran Ke</Text>
            <Text style={styles.notesText}>{businessConfig.bank.bankName}</Text>
            <Text style={styles.notesText}>a.n. {businessConfig.bank.accountName}</Text>
            <Text style={styles.notesText}>{businessConfig.bank.accountNumber}</Text>
          </View>
          {invoice.notes ? (
            <View style={styles.footerBox}>
              <Text style={styles.sectionLabel}>Catatan</Text>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  )
}
