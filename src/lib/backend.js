import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, OFFICE_EMAIL } from '../config.js';

// With no Supabase settings, the app falls back to this browser's local
// storage so it can be tried out - but numbers are NOT shared between
// computers in that mode.
export const isDemoMode = !SUPABASE_URL || !SUPABASE_ANON_KEY;

const supabase = isDemoMode ? null : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MONEY_FIELDS = ['loan_amount', 'processing_fee', 'previous_balance', 'miscellaneous', 'cash_in_bank'];

function toRecord(voucher) {
  const record = { ...voucher };
  for (const field of MONEY_FIELDS) record[field] = parseFloat(voucher[field]) || 0;
  if (!record.voucher_date) record.voucher_date = null;
  return record;
}

// ---------- demo-mode storage (this browser only) ----------
const COUNTER_KEY = 'cv_counter';
const VOUCHERS_KEY = 'cv_vouchers';

const readCounter = () =>
  JSON.parse(localStorage.getItem(COUNTER_KEY) || '{"prefix":"JRM26","last_number":5257}');
const readVouchers = () => JSON.parse(localStorage.getItem(VOUCHERS_KEY) || '[]');

// ---------- password lock (shared office account) ----------

// True when this browser is already unlocked (has a valid session).
export async function hasSession() {
  if (isDemoMode) return true;
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

// Signs in with the shared office password. Throws if it is wrong.
export async function unlock(password) {
  const { error } = await supabase.auth.signInWithPassword({
    email: OFFICE_EMAIL,
    password,
  });
  if (error) throw error;
}

// ---------- API used by the app ----------

export async function reserveLoanNumber() {
  if (isDemoMode) {
    const counter = readCounter();
    counter.last_number += 1;
    localStorage.setItem(COUNTER_KEY, JSON.stringify(counter));
    return `${counter.prefix}-${counter.last_number}`;
  }
  const { data, error } = await supabase.rpc('reserve_loan_number');
  if (error) throw error;
  return data;
}

export async function saveVoucher(voucher) {
  const record = toRecord(voucher);
  if (isDemoMode) {
    const all = readVouchers().filter((v) => v.loan_number !== record.loan_number);
    all.unshift({ ...record, created_at: new Date().toISOString() });
    localStorage.setItem(VOUCHERS_KEY, JSON.stringify(all));
    return;
  }
  const { error } = await supabase.from('vouchers').upsert(record, { onConflict: 'loan_number' });
  if (error) throw error;
}

export async function listVouchers(search = '') {
  if (isDemoMode) {
    const q = search.trim().toLowerCase();
    return readVouchers().filter(
      (v) =>
        !q ||
        (v.loan_number || '').toLowerCase().includes(q) ||
        (v.borrower || '').toLowerCase().includes(q)
    );
  }
  let query = supabase
    .from('vouchers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  const q = search.trim();
  if (q) query = query.or(`loan_number.ilike.%${q}%,borrower.ilike.%${q}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function deleteVoucher(loanNumber) {
  if (isDemoMode) {
    const all = readVouchers().filter((v) => v.loan_number !== loanNumber);
    localStorage.setItem(VOUCHERS_KEY, JSON.stringify(all));
    return;
  }
  const { error } = await supabase.from('vouchers').delete().eq('loan_number', loanNumber);
  if (error) throw new Error(error.message);
}

export async function getCounter() {
  if (isDemoMode) return readCounter();
  const { data, error } = await supabase.from('voucher_counter').select('*').eq('id', 1).single();
  if (error) throw error;
  return data;
}

// Changing the counter needs the separate Settings password (not the office
// login password) - checked by the database itself in update_counter().
export async function updateCounter(prefix, lastNumber, settingsPassword) {
  if (isDemoMode) {
    localStorage.setItem(COUNTER_KEY, JSON.stringify({ prefix, last_number: lastNumber }));
    return;
  }
  const { error } = await supabase.rpc('update_counter', {
    p_prefix: prefix,
    p_last_number: lastNumber,
    p_password: settingsPassword,
  });
  if (error) throw new Error(error.message);
}

export async function changeSettingsPassword(oldPassword, newPassword) {
  if (isDemoMode) return;
  const { error } = await supabase.rpc('change_settings_password', {
    p_old_password: oldPassword,
    p_new_password: newPassword,
  });
  if (error) throw new Error(error.message);
}
