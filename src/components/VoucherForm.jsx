export default function VoucherForm({ voucher, onChange }) {
  const field = (name, label, props = {}) => (
    <div className="field">
      <label>{label}</label>
      <input
        value={voucher[name]}
        onChange={(e) => onChange(name, e.target.value)}
        {...props}
      />
    </div>
  );

  return (
    <div>
      {field('loan_number', 'Loan Number', { readOnly: true })}
      {field('borrower', 'Borrower Name (Pay to / Received by)')}
      {field('voucher_date', 'Date', { type: 'date' })}
      {field('particulars', 'Particulars', { placeholder: 'e.g. A/R Loan Renewal FAO 26-5088' })}
      <div className="field-row">
        {field('loan_amount', 'Loan Amount', { type: 'number', step: '0.01', min: '0' })}
        {field('processing_fee', 'Processing Fee', { type: 'number', step: '0.01', min: '0' })}
      </div>
      <div className="field-row">
        {field('previous_balance', 'Loan Balance (previous)', { type: 'number', step: '0.01', min: '0' })}
        {field('miscellaneous', 'Miscellaneous', { type: 'number', step: '0.01', min: '0' })}
      </div>
      {field('cash_in_bank', 'Cash in Bank (auto-calculated)', { type: 'number', step: '0.01' })}
      {field('amount_in_words', 'Amount in Words (auto-generated)')}
      <div className="field-row">
        {field('bank', 'Bank')}
        {field('check_number', 'Check Number')}
      </div>
      {field('cash', 'Cash')}
      <div className="field-row">
        {field('prepared_by', 'Prepared By')}
        {field('corrected_by', 'Corrected By')}
      </div>
      {field('approved_by', 'Approved By')}
    </div>
  );
}
