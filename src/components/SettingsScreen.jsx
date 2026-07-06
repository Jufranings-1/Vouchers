import { useEffect, useState } from 'react';
import { isDemoMode, getCounter, updateCounter, changeSettingsPassword } from '../lib/backend.js';

export default function SettingsScreen() {
  const [prefix, setPrefix] = useState('');
  const [lastNumber, setLastNumber] = useState('');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    getCounter()
      .then((counter) => {
        setPrefix(counter.prefix);
        setLastNumber(String(counter.last_number));
        setLoaded(true);
      })
      .catch((e) => setError('Could not load settings: ' + (e.message || e)));
  }, []);

  const nextNumber = `${prefix}-${(parseInt(lastNumber, 10) || 0) + 1}`;

  async function handleSave() {
    const n = parseInt(lastNumber, 10);
    if (!prefix.trim() || isNaN(n) || n < 0) {
      alert('Enter a prefix and a valid last number.');
      return;
    }
    if (!isDemoMode && !settingsPassword) {
      alert('Enter the Settings password to change the loan number.');
      return;
    }
    const ok = window.confirm(
      `The NEXT loan number handed out will be:\n\n${prefix.trim()}-${n + 1}\n\nSave these settings?`
    );
    if (!ok) return;
    setSaving(true);
    try {
      await updateCounter(prefix.trim(), n, settingsPassword);
      setSettingsPassword('');
      alert('Settings saved.');
    } catch (e) {
      alert('Could not save: ' + (e.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!oldPw || !newPw) {
      alert('Enter the current and new Settings password.');
      return;
    }
    setChangingPw(true);
    try {
      await changeSettingsPassword(oldPw, newPw);
      setOldPw('');
      setNewPw('');
      alert('Settings password changed.');
    } catch (e) {
      alert('Could not change password: ' + (e.message || e));
    } finally {
      setChangingPw(false);
    }
  }

  return (
    <div className="panel settings-panel">
      <h2>Settings</h2>
      <p className="hint">
        Set these once when the client confirms their current loan number, and again only when the
        prefix changes (for example at the start of a new year). The system continues counting from
        the "last issued number" — it never reuses a number.
        {!isDemoMode && ' Changing these requires the separate Settings password below, not the office login password.'}
      </p>

      {error && <p className="error-text">{error}</p>}

      <div className="field">
        <label>Prefix</label>
        <input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="e.g. JRM26" />
      </div>
      <div className="field">
        <label>Last issued number</label>
        <input
          type="number"
          value={lastNumber}
          onChange={(e) => setLastNumber(e.target.value)}
          placeholder="e.g. 5257"
        />
      </div>

      {loaded && (
        <p>
          Next loan number will be: <strong>{nextNumber}</strong>
        </p>
      )}

      {!isDemoMode && (
        <div className="field">
          <label>Settings Password</label>
          <input
            type="password"
            value={settingsPassword}
            onChange={(e) => setSettingsPassword(e.target.value)}
            placeholder="Required to save changes above"
          />
        </div>
      )}

      <button className="btn btn-primary" onClick={handleSave} disabled={saving || !loaded}>
        {saving ? 'Saving…' : 'Save Settings'}
      </button>

      {!isDemoMode && (
        <div className="settings-divider">
          <h3>Change Settings Password</h3>
          <div className="field">
            <label>Current Settings Password</label>
            <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} />
          </div>
          <div className="field">
            <label>New Settings Password</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </div>
          <button className="btn" onClick={handleChangePassword} disabled={changingPw}>
            {changingPw ? 'Changing…' : 'Change Password'}
          </button>
        </div>
      )}
    </div>
  );
}
