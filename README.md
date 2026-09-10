# Invoice Tracker

Personal tool to generate brand endorsement/collab invoices as PDF and track payment status. Single-user, built to be fast to use from phone or desktop.

**Stack:** React + Vite + Tailwind CSS, Supabase (Postgres + Auth), `@react-pdf/renderer`, deployed on Vercel.

## Features

- Create an invoice: brand info, multiple rate-card line items, term of payment (TOP), auto-calculated due date and total
- Generates a clean, professional PDF invoice on submit and downloads it
- Dashboard: summary cards (brands worked with, invoices issued, total paid, total pending), sortable invoice table
- Overdue invoices (`due_date` passed, still `pending`) are highlighted red with an "Overdue" badge and a counter
- Mark an invoice as paid with one click (records `paid_date`)

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](./supabase/schema.sql) — creates the `invoices` table, indexes, and row-level security policies (only authenticated users can read/write; there's no public sign-up).
3. Under **Authentication → Users**, manually create your one user (email + password). Sign-up is not exposed in the app on purpose.
4. Under **Project Settings → API**, copy the **Project URL** and **anon public key**.

## 2. Configure the app

Fill in your own details in [`src/config/business.js`](./src/config/business.js) — name, address, contact, and bank account. This shows up on every invoice PDF and is hardcoded rather than a form field since it never changes.

Copy the env template and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run locally

```bash
npm install
npm run dev
```

## 4. Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Framework preset: Vite (auto-detected).
3. Add the two env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in Vercel project settings.
4. Deploy. `vercel.json` handles SPA client-side routing rewrites.

## Notes

- This is intentionally single-user: RLS policies allow any *authenticated* user full access to the `invoices` table, and there's no sign-up flow — you create your one account directly in the Supabase dashboard.
- Invoice numbers are generated as `INV-YYYYMM-XXX`, sequential per month, based on existing rows in Supabase.
