import { useEffect, useState } from 'react';
import VoucherPreview from './VoucherPreview.jsx';
import { listVouchers, deleteVoucher } from '../lib/backend.js';
import { downloadVoucherPng, printVoucherImage } from '../lib/voucherImage.js';

const fmt = (value) =>
  (Number(value) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function HistoryScreen({ onEdit }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(query) {
    setLoading(true);
    setError('');
    try {
      setRows(await listVouchers(query));
    } catch (e) {
      setError('Could not load history: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load('');
  }, []);

  async function handleDelete(row) {
    const ok = window.confirm(
      `Delete voucher ${row.loan_number}${row.borrower ? ` (${row.borrower})` : ''}?\n\n` +
        'This removes it from History permanently. The loan number stays used and will NOT be given out again.'
    );
    if (!ok) return;
    try {
      await deleteVoucher(row.loan_number);
      await load(search);
    } catch (e) {
      alert('Could not delete: ' + (e.message || e));
    }
  }

  return (
    <div className="panel">
      <h2>Voucher History</h2>
      <form
        className="search-row"
        onSubmit={(e) => {
          e.preventDefault();
          load(search);
        }}
      >
        <input
          placeholder="Search by loan number or borrower name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn" type="submit">Search</button>
        <button className="btn" type="button" onClick={() => load(search)} disabled={loading}>
          ⟳ Refresh
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Loan No.</th>
              <th>Date</th>
              <th>Borrower</th>
              <th>Loan Amount</th>
              <th>Cash in Bank</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.loan_number}>
                <td><strong>{row.loan_number}</strong></td>
                <td>{row.voucher_date || ''}</td>
                <td>{row.borrower}</td>
                <td>{fmt(row.loan_amount)}</td>
                <td>{fmt(row.cash_in_bank)}</td>
                <td className="history-actions">
                  <button className="btn" onClick={() => setSelected(row)}>View</button>
                  <button className="btn" onClick={() => onEdit(row)}>✎ Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(row)}>🗑 Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="6">No vouchers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-actions">
              <button
                className="btn"
                onClick={() => printVoucherImage().catch((e) => alert('Could not print: ' + (e.message || e)))}
              >
                🖨 Print
              </button>
              <button
                className="btn"
                onClick={() =>
                  downloadVoucherPng(selected.loan_number).catch((e) =>
                    alert('Could not create the image: ' + (e.message || e))
                  )
                }
              >
                ⬇ Download
              </button>
              <button className="btn" onClick={() => setSelected(null)}>Close</button>
            </div>
            <VoucherPreview voucher={selected} />
          </div>
        </div>
      )}
    </div>
  );
}
