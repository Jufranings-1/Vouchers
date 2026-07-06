-- Adds a SECOND password that protects editing the loan number counter
-- (prefix / last issued number) in Settings, separate from the office
-- login password everyone uses to open the app.
--
-- This is enforced by the database itself, not just hidden in the browser:
-- after this script runs, updating voucher_counter directly is blocked for
-- everyone. The ONLY way to change it is the update_counter() function
-- below, which checks the settings password first.
--
-- Default settings password after running this script: ChangeThis123
-- Change it immediately from the app: Settings -> Change Settings Password.
--
-- Safe to run more than once.

create extension if not exists pgcrypto;

create table if not exists admin_settings (
  id integer primary key default 1,
  password_hash text not null
);

insert into admin_settings (id, password_hash)
values (1, crypt('ChangeThis123', gen_salt('bf')))
on conflict (id) do nothing;

-- No one can read or write this table directly - only the functions below
-- (owned by the table owner, which bypasses RLS) can touch it.
alter table admin_settings enable row level security;

-- Take away direct UPDATE access to the counter. Reading it still works
-- (needed to show the current prefix/number), but changing it now has to
-- go through update_counter(), which checks the settings password.
drop policy if exists "staff can update counter" on voucher_counter;

create or replace function update_counter(p_prefix text, p_last_number integer, p_password text)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (
    select 1 from admin_settings where id = 1 and password_hash = crypt(p_password, password_hash)
  ) then
    raise exception 'Incorrect settings password';
  end if;

  update voucher_counter set prefix = p_prefix, last_number = p_last_number where id = 1;
end;
$$;

create or replace function change_settings_password(p_old_password text, p_new_password text)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (
    select 1 from admin_settings where id = 1 and password_hash = crypt(p_old_password, password_hash)
  ) then
    raise exception 'Incorrect current settings password';
  end if;

  update admin_settings set password_hash = crypt(p_new_password, gen_salt('bf')) where id = 1;
end;
$$;

revoke execute on function update_counter(text, integer, text) from public, anon;
grant execute on function update_counter(text, integer, text) to authenticated;

revoke execute on function change_settings_password(text, text) from public, anon;
grant execute on function change_settings_password(text, text) to authenticated;
