-- Allows signed-in staff to delete vouchers from History (the Delete
-- button). Deleting removes the voucher record permanently; the loan
-- number stays used and is never handed out again.
--
-- Run the whole file in: Supabase Dashboard -> SQL Editor -> New query.
-- Safe to run more than once.

drop policy if exists "staff can delete vouchers" on vouchers;
create policy "staff can delete vouchers" on vouchers for delete to authenticated using (true);
