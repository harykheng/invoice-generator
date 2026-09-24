-- Adds tax support to an existing invoices table.
-- Run this once in the Supabase SQL editor if your table was created
-- before tax_type/tax_value existed (schema.sql already includes them
-- for a fresh install). Safe to re-run.

alter table invoices add column if not exists tax_type text not null default 'none';
alter table invoices add column if not exists tax_value numeric not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'invoices_tax_type_check'
  ) then
    alter table invoices add constraint invoices_tax_type_check
      check (tax_type in ('none', 'percent', 'fixed'));
  end if;
end $$;
