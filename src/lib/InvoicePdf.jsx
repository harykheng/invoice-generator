import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { businessConfig } from '../config/business'
import { formatDateLong } from './invoiceUtils'

Font.register({
  family: 'Dancing Script',
  src: 'https://fonts.gstatic.com/s/dancingscript/v29/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7B1i0HTQ.ttf',
  fontWeight: 700,
})

function formatIDR(amount) {
  const rounded = Math.round(Number(amount) || 0)
  return `IDR ${rounded.toLocaleString('id-ID')}`
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#000000',
  },
  bar: {
    height: 16,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 44,
    paddingTop: 32,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 36,
  },
  headerLeft: {
    maxWidth: '55%',
  },
  headerRight: {
    maxWidth: '45%',
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 26,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  issuerName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    marginBottom: 10,
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  metaLine: {
    fontSize: 9,
    marginBottom: 3,
    lineHeight: 1.3,
  },
  metaLineRight: {
    fontSize: 9,
    marginBottom: 3,
    lineHeight: 1.3,
    textAlign: 'right',
  },
  sectionLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    marginBottom: 10,
  },
  billToBlock: {
    marginBottom: 32,
  },
  billToLine: {
    fontSize: 9,
    marginBottom: 3,
    lineHeight: 1.3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#ffffff',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableRowAlt: {
    backgroundColor: '#f3f3f3',
  },
  tableCell: {
    fontSize: 9,
  },
  colItem: { width: '10%' },
  colDesc: { width: '42%' },
  colQty: { width: '23%', textAlign: 'right' },
  colPrice: { width: '25%', textAlign: 'right' },
  totalsBlock: {
    marginTop: 18,
    alignItems: 'flex-end',
  },
  subtotalRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  subtotalLabel: {
    fontSize: 9,
    marginRight: 28,
  },
  subtotalValue: {
    fontSize: 9,
  },
  totalBox: {
    backgroundColor: '#f3f3f3',
    paddingVertical: 11,
    paddingHorizontal: 18,
    minWidth: 220,
  },
  totalText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    textAlign: 'right',
  },
  spacer: {
    flexGrow: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  paymentLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginBottom: 8,
  },
  paymentLine: {
    fontSize: 9,
    marginBottom: 3,
  },
  paymentBold: {
    fontFamily: 'Helvetica-Bold',
  },
  notesBlock: {
    marginTop: 16,
    maxWidth: 260,
  },
  notesLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    marginBottom: 3,
  },
  notesText: {
    fontSize: 8.5,
    lineHeight: 1.4,
  },
  signatureBlock: {
    alignItems: 'center',
  },
  signature: {
    fontFamily: 'Dancing Script',
    fontSize: 28,
    marginBottom: 4,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    width: 150,
  },
})

export default function InvoicePdf({ invoice }) {
  const items = invoice.items || []
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0),
    0,
  )

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.bar} fixed />

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text style={styles.metaLine}>Invoice Number: {invoice.invoice_number}</Text>
              <Text style={styles.metaLine}>Date: {formatDateLong(invoice.invoice_date)}</Text>
              <Text style={styles.metaLine}>Due Date: {formatDateLong(invoice.due_date)}</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.issuerName}>{businessConfig.name.toUpperCase()}</Text>
              {businessConfig.phone ? (
                <Text style={styles.metaLineRight}>{businessConfig.phone}</Text>
              ) : null}
              {businessConfig.address ? (
                <Text style={styles.metaLineRight}>{businessConfig.address}</Text>
              ) : null}
              {businessConfig.taxId ? (
                <Text style={styles.metaLineRight}>NPWP: {businessConfig.taxId}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.billToBlock}>
            <Text style={styles.sectionLabel}>BILL TO:</Text>
            <Text style={styles.billToLine}>{invoice.brand_name}</Text>
            {invoice.pt_name ? <Text style={styles.billToLine}>{invoice.pt_name}</Text> : null}
            {invoice.pt_address ? (
              <Text style={styles.billToLine}>{invoice.pt_address}</Text>
            ) : null}
            {invoice.pt_contact ? (
              <Text style={styles.billToLine}>{invoice.pt_contact}</Text>
            ) : null}
          </View>

          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colItem]}>ITEM</Text>
              <Text style={[styles.tableHeaderCell, styles.colDesc]}>DESCRIPTION</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>QTY</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>PRICE</Text>
            </View>
            {items.map((item, idx) => (
              <View
                style={[styles.tableRow, idx % 2 === 0 ? styles.tableRowAlt : null]}
                key={idx}
              >
                <Text style={[styles.tableCell, styles.colItem]}>{idx + 1}.</Text>
                <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.colQty]}>
                  {item.qty} {item.unit || ''}
                </Text>
                <Text style={[styles.tableCell, styles.colPrice]}>{formatIDR(item.price)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Sub Total:</Text>
              <Text style={styles.subtotalValue}>{formatIDR(subtotal)}</Text>
            </View>
            <View style={styles.totalBox}>
              <Text style={styles.totalText}>TOTAL: {formatIDR(invoice.total_amount)}</Text>
            </View>
          </View>

          {invoice.notes ? (
            <View style={styles.notesBlock}>
              <Text style={styles.notesLabel}>NOTES:</Text>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
          ) : null}

          <View style={styles.spacer} />

          <View style={styles.footerRow}>
            <View>
              <Text style={styles.paymentLabel}>PAYMENT INFORMATION:</Text>
              <Text style={styles.paymentLine}>
                <Text style={styles.paymentBold}>Bank: </Text>
                {businessConfig.bank.bankName}
              </Text>
              <Text style={styles.paymentLine}>
                <Text style={styles.paymentBold}>Name: </Text>
                {businessConfig.bank.accountName}
              </Text>
              <Text style={styles.paymentLine}>
                <Text style={styles.paymentBold}>Account: </Text>
                {businessConfig.bank.accountNumber}
              </Text>
            </View>
            <View style={styles.signatureBlock}>
              <Text style={styles.signature}>{businessConfig.name}</Text>
              <View style={styles.signatureLine} />
            </View>
          </View>
        </View>

        <View style={styles.bar} fixed />
      </Page>
    </Document>
  )
}
