import logoUrl from '../assets/logo.png';

function num(voucher, key) {
  return parseFloat(voucher[key]) || 0;
}

function formatLoanNumber(loanNumber) {
  if (!loanNumber) return '';
  return loanNumber.replace('-', ' - ');
}

function money(value) {
  if (!value) return '–';
  return value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function VoucherPreview({ voucher }) {
  const loanAmount = num(voucher, 'loan_amount');
  const fee = num(voucher, 'processing_fee');
  const previousBalance = num(voucher, 'previous_balance');
  const misc = num(voucher, 'miscellaneous');
  const cashInBank = num(voucher, 'cash_in_bank');

  // Standard lending voucher entries: the new receivable is the debit; the
  // deductions (fee, previous balance, misc) and the released cash are the
  // credits. When entries are correct, both totals equal the Loan Amount.
  const debitTotal = loanAmount;
  const creditTotal = fee + previousBalance + misc + cashInBank;

  return (
    <div className="voucher voucher-print">
      <div className="v-header">
        <div className="v-logo">
          <img src={logoUrl} alt="J2M Lending Investor Inc." className="v-logo-img" />
          <div className="v-logo-text">LENDING INVESTOR INC.</div>
        </div>
        <div className="v-payto">
          <div className="v-tab">CHECK VOUCHER</div>
          <div className="v-payto-box">
            <strong>{voucher.borrower}</strong>
          </div>
        </div>
        <div className="v-meta">
          <div>
            <span>Loan No.</span>
            <strong className="v-underline">{formatLoanNumber(voucher.loan_number)}</strong>
          </div>
          <div>
            <span>Date</span>
            <span className="v-underline">{formatDate(voucher.voucher_date)}</span>
          </div>
        </div>
      </div>

      <table className="v-table v-particulars">
        <thead>
          <tr>
            <th>PARTICULARS</th>
            <th className="amt">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="v-particulars-amt">{voucher.particulars}</td>
            <td className="amt v-particulars-amt">{money(loanAmount)}</td>
          </tr>
        </tbody>
      </table>

      <div className="v-mid">
        <div className="v-dist">
          <div className="v-section-title">DISTRIBUTION OF ACCOUNT</div>
          <table className="v-table">
            <thead>
              <tr>
                <th>ACCOUNT TITLE</th>
                <th className="amt">DEBIT</th>
                <th className="amt">CREDIT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>A/R Loan Receivables</td>
                <td className="amt">{money(loanAmount)}</td>
                <td className="amt">–</td>
              </tr>
              <tr>
                <td>Processing Fee</td>
                <td className="amt">–</td>
                <td className="amt">{money(fee)}</td>
              </tr>
              <tr>
                <td>Loan Balance</td>
                <td className="amt">–</td>
                <td className="amt">{money(previousBalance)}</td>
              </tr>
              <tr>
                <td>Misc.</td>
                <td className="amt">–</td>
                <td className="amt">{money(misc)}</td>
              </tr>
              <tr className="v-red">
                <td>Cash in Bank</td>
                <td className="amt">–</td>
                <td className="amt">{money(cashInBank)}</td>
              </tr>
              <tr className="v-totals">
                <td>TOTALS</td>
                <td className="amt">{money(debitTotal)}</td>
                <td className="amt">{money(creditTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="v-right">
          <div className="v-pesos">
            <div className="v-pesos-head">₱ PESOS</div>
            <div className="v-words">{voucher.amount_in_words}</div>
            <div className="v-bankline">
              <span>
                Bank <u>{voucher.bank}</u>
              </span>
              <span>
                Check No. <u>{voucher.check_number}</u>
              </span>
              <span>
                Cash <u>{voucher.cash}</u>
              </span>
            </div>
          </div>
          <div className="v-received">
            <span>Received by:</span>
            <div className="v-sign-line">{voucher.borrower}</div>
          </div>
        </div>
      </div>

      <div className="v-signatures">
        <div className="v-sig">
          <span>Prepared by:</span>
          <div className="v-sign-line">{voucher.prepared_by}</div>
        </div>
        <div className="v-sig">
          <span>Corrected by:</span>
          <div className="v-sign-line">{voucher.corrected_by}</div>
        </div>
        <div className="v-sig">
          <span>Approved by:</span>
          <div className="v-sign-line">{voucher.approved_by}</div>
        </div>
      </div>
    </div>
  );
}
