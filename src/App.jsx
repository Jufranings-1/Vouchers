import { useEffect, useState } from 'react';
import VoucherForm from './components/VoucherForm.jsx';
import VoucherPreview from './components/VoucherPreview.jsx';
import HistoryScreen from './components/HistoryScreen.jsx';
import SettingsScreen from './components/SettingsScreen.jsx';
import PasswordGate from './components/PasswordGate.jsx';
import { isDemoMode, hasSession, reserveLoanNumber, saveVoucher } from './lib/backend.js';
import { pesosInWords } from './lib/numberToWords.js';
import { downloadVoucherHtml } from './lib/download.js';

const today = () => new Date().toISOString().slice(0, 10);

const emptyVoucher = () => ({
  loan_number: '',
  borrower: '',
  voucher_date: today(),
  particulars: '',
  loan_amount: '',
  processing_fee: '',
  previous_balance: '',
  miscellaneous: '',
  cash_in_bank: '',
  amount_in_words: '',
  bank: '',
  check_number: '',
  cash: '',
  prepared_by: '',
  corrected_by: '',
  approved_by: '',
});

export default function App() {
  // null = still checking, false = locked, true = unlocked
  const [unlocked, setUnlocked] = useState(isDemoMode ? true : null);
  const [screen, setScreen] = useState('voucher');
  const [voucher, setVoucher] = useState(emptyVoucher());
  // Cash in Bank and Amount in Words auto-fill until the user types their
  // own value into them; then we stop overwriting.
  const [manual, setManual] = useState({ cash: false, words: false });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isDemoMode) hasSession().then(setUnlocked);
  }, []);

  function updateField(name, value) {
    const next = { ...voucher, [name]: value };
    const m = {
      cash: manual.cash || name === 'cash_in_bank',
      words: manual.words || name === 'amount_in_words',
    };
    if (!m.cash) {
      const num = (k) => parseFloat(next[k]) || 0;
      const computed =
        num('loan_amount') - num('processing_fee') - num('previous_balance') - num('miscellaneous');
      next.cash_in_bank = next.loan_amount === '' ? '' : String(Math.round(computed * 100) / 100);
    }
    if (!m.words) {
      next.amount_in_words =
        next.cash_in_bank === '' ? '' : pesosInWords(parseFloat(next.cash_in_bank) || 0);
    }
    setManual(m);
    setVoucher(next);
  }

  async function persistCurrent() {
    if (!voucher.loan_number || !voucher.borrower.trim()) return;
    await saveVoucher(voucher);
  }

  async function handleNewTransaction() {
    if (voucher.loan_number) {
      const ok = window.confirm(
        'Start a new transaction?\n\nThe current voucher will be saved to History and the form will be cleared.'
      );
      if (!ok) return;
    }
    setBusy(true);
    try {
      await persistCurrent();
      const loanNumber = await reserveLoanNumber();
      setVoucher({ ...emptyVoucher(), loan_number: loanNumber });
      setManual({ cash: false, words: false });
    } catch (e) {
      alert('Something went wrong: ' + (e.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function handlePrint() {
    try {
      await persistCurrent();
    } catch (e) {
      alert(
        'WARNING: This voucher could NOT be saved to History.\n\n' +
          (e.message || e) +
          '\n\nIt will still print, but check your internet connection and try Print again once ' +
          'reconnected — otherwise it will be missing from History.'
      );
    }
    window.print();
  }

  if (unlocked === null) return null;
  if (!unlocked) return <PasswordGate onUnlocked={() => setUnlocked(true)} />;

  return (
    <>
      <header className="topbar">
        <h1>Check Voucher System</h1>
        <nav>
          <button className={screen === 'voucher' ? 'active' : ''} onClick={() => setScreen('voucher')}>
            New Voucher
          </button>
          <button className={screen === 'history' ? 'active' : ''} onClick={() => setScreen('history')}>
            History
          </button>
          <button className={screen === 'settings' ? 'active' : ''} onClick={() => setScreen('settings')}>
            Settings
          </button>
        </nav>
      </header>

      {isDemoMode && (
        <div className="demo-banner">
          ⚠ Demo mode — no shared database connected. Loan numbers and history are stored on THIS
          computer only. Follow README.md ("Connect the database") before the office uses this.
        </div>
      )}

      {screen === 'voucher' && (
        <div className="layout">
          <div className="form-panel">
            <div className="actions" style={{ marginTop: 0, marginBottom: 14 }}>
              <button className="btn btn-primary" onClick={handleNewTransaction} disabled={busy}>
                {busy ? 'Reserving number…' : voucher.loan_number ? 'Next Transaction' : 'New Transaction'}
              </button>
            </div>

            {voucher.loan_number ? (
              <>
                <VoucherForm voucher={voucher} onChange={updateField} />
                <div className="actions">
                  <button className="btn" onClick={handlePrint}>🖨 Print</button>
                  <button className="btn" onClick={() => downloadVoucherHtml(voucher.loan_number)}>
                    ⬇ Download
                  </button>
                </div>
              </>
            ) : (
              <p className="hint">
                Click <strong>New Transaction</strong> to reserve the next loan number and start a
                voucher. The number is locked to you the moment it appears — no other user can get
                the same one.
              </p>
            )}
          </div>

          <div className="preview-panel">
            <VoucherPreview voucher={voucher} />
          </div>
        </div>
      )}

      {screen === 'history' && <HistoryScreen />}
      {screen === 'settings' && <SettingsScreen />}
    </>
  );
}
