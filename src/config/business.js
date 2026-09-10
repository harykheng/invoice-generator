// Hardcoded issuer info — edit this once, it shows up on every invoice PDF.
export const businessConfig = {
  name: 'Regina',
  fullName: 'Regina',
  address: 'Jakarta, Indonesia',
  email: 'your-email@example.com',
  phone: '+62 812-3456-7890',
  bank: {
    bankName: 'Bank BCA',
    accountName: 'Regina',
    accountNumber: '1234567890',
  },
  taxId: '', // NPWP, optional — leave blank to hide on PDF
}
