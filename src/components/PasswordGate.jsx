import { useState } from 'react';
import { unlock } from '../lib/backend.js';
import logoUrl from '../assets/logo.png';

export default function PasswordGate({ onUnlocked }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError('');
    try {
      await unlock(password);
      onUnlocked();
    } catch {
      setError('Wrong password. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="gate">
      <form className="gate-card" onSubmit={handleSubmit}>
        <img src={logoUrl} alt="J2M Lending Investor Inc." className="gate-logo-img" />
        <h2>Check Voucher System</h2>
        <p>Enter the office password to continue. You will only be asked once on this device.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Office password"
          autoFocus
        />
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Checking…' : 'Open'}
        </button>
      </form>
    </div>
  );
}
