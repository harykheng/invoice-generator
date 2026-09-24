-- Invoice Tracker schema — single-user setup.
-- Run this in the Supabase SQL editor after creating your project.

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  pt_name text,
  pt_address text,
  pt_contact text,
  invoice_number text not null unique,
  invoice_date date not null,
  items jsonb not null default '[]'::jsonb,
  tax_type text not null default 'none' check (tax_type in ('none', 'percent', 'fixed')),
  tax_value numeric not null default 0,
  total_amount numeric not null default 0,
  payment_term_days integer not null default 14,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  paid_date date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists invoices_status_idx on invoices (status);
create index if not exists invoices_due_date_idx on invoices (due_date);
create index if not exists invoices_invoice_date_idx on invoices (invoice_date);

-- Row Level Security: this app is single-user, so any authenticated
-- Supabase user (i.e. you, signed in via email/password) can read/write.
-- No public/anon access is granted.
alter table invoices enable row level security;

create policy "Authenticated users can read invoices"
  on invoices for select
  to authenticated
  using (true);

create policy "Authenticated users can insert invoices"
  on invoices for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update invoices"
  on invoices for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete invoices"
  on invoices for delete
  to authenticated
  using (true);
