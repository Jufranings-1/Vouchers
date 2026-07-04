-- Locks the database so ONLY signed-in staff can use it.
--
-- BEFORE running this, create the shared office account:
--   Supabase Dashboard -> Authentication -> Users -> Add user -> Create new user
--     Email:    office@jrm-vouchers.app   (must match OFFICE_EMAIL in src/config.js)
--     Password: (the office password you chose)
--     "Auto Confirm User": CHECKED
--
-- Then run this whole file in the SQL Editor. Safe to run more than once.
-- After this runs, anyone who has not entered the office password gets
-- nothing from the database - no numbers, no history.

-- Remove the old open-access rules
drop policy if exists "office can read counter"   on voucher_counter;
drop policy if exists "office can update counter" on voucher_counter;
drop policy if exists "office can read vouchers"   on vouchers;
drop policy if exists "office can insert vouchers" on vouchers;
drop policy if exists "office can update vouchers" on vouchers;

-- New rules: signed-in (authenticated) users only
drop policy if exists "staff can read counter"   on voucher_counter;
drop policy if exists "staff can update counter" on voucher_counter;
drop policy if exists "staff can read vouchers"   on vouchers;
drop policy if exists "staff can insert vouchers" on vouchers;
drop policy if exists "staff can update vouchers" on vouchers;

create policy "staff can read counter"  on voucher_counter for select to authenticated using (true);
create policy "staff can update counter" on voucher_counter for update to authenticated using (true) with check (true);

create policy "staff can read vouchers"   on vouchers for select to authenticated using (true);
create policy "staff can insert vouchers" on vouchers for insert to authenticated with check (true);
create policy "staff can update vouchers" on vouchers for update to authenticated using (true) with check (true);

-- The loan-number function too: signed-in users only
revoke execute on function reserve_loan_number() from public;
revoke execute on function reserve_loan_number() from anon;
grant execute on function reserve_loan_number() to authenticated;
