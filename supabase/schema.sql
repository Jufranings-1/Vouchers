-- Check Voucher System - one-time Supabase setup
-- Where to run this: Supabase Dashboard -> SQL Editor -> New query -> paste everything -> Run

-- 1) The shared counter. One single row holds the prefix and the last issued number.
create table if not exists voucher_counter (
  id integer primary key,
  prefix text not null default 'JRM26',
  last_number integer not null default 0
);

-- Starting point (change later from the app's Settings screen once the
-- client confirms their current number).
insert into voucher_counter (id, prefix, last_number)
values (1, 'JRM26', 5257)
on conflict (id) do nothing;

-- 2) Every completed voucher, for the shared History screen.
create table if not exists vouchers (
  id bigint generated always as identity primary key,
  loan_number text not null unique,
  borrower text,
  voucher_date date,
  particulars text,
  loan_amount numeric not null default 0,
  processing_fee numeric not null default 0,
  previous_balance numeric not null default 0,
  miscellaneous numeric not null default 0,
  cash_in_bank numeric not null default 0,
  amount_in_words text,
  bank text,
  check_number text,
  cash text,
  prepared_by text,
  corrected_by text,
  approved_by text,
  created_at timestamptz not null default now()
);

-- 3) The heart of the system: hands out the next loan number atomically.
-- The row lock taken by UPDATE means that even if three users click
-- "New Transaction" in the same millisecond, Postgres serves them one at a
-- time and each gets a different number. Duplicates are impossible.
create or replace function reserve_loan_number()
returns text
language plpgsql
security definer
as $$
declare
  new_number integer;
  pfx text;
begin
  update voucher_counter
     set last_number = last_number + 1
   where id = 1
   returning last_number, prefix into new_number, pfx;
  return pfx || '-' || new_number;
end;
$$;

-- 4) Access rules. This is an office-internal tool with no logins, so the
-- public (anon) key gets read/write access. Anyone with the site URL can
-- use the system - keep the URL within the office.
alter table voucher_counter enable row level security;
alter table vouchers enable row level security;

create policy "office can read counter"  on voucher_counter for select to anon using (true);
create policy "office can update counter" on voucher_counter for update to anon using (true) with check (true);

create policy "office can read vouchers"   on vouchers for select to anon using (true);
create policy "office can insert vouchers" on vouchers for insert to anon with check (true);
create policy "office can update vouchers" on vouchers for update to anon using (true) with check (true);
