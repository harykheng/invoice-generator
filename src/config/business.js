// Hardcoded issuer info — edit this once, it shows up on every invoice PDF.
export const businessConfig = {
  name: 'Regina',
  fullName: 'Regina',
  address: 'Jakarta, Indonesia',
  email: 'your-email@example.com',
  phone: '+62 812-9256-7788',
  bank: {
    bankName: 'Bank BCA',
    accountName: 'Regina Clara',
    accountNumber: '8805029940',
  },
  taxId: '', // NPWP, optional — leave blank to hide on PDF
}
