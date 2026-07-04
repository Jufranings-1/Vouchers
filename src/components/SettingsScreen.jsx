import { useEffect, useState } from 'react';
import { getCounter, updateCounter } from '../lib/backend.js';

export default function SettingsScreen() {
  const [prefix, setPrefix] = useState('');
  const [lastNumber, setLastNumber] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    const ok = window.confirm(
      `The NEXT loan number handed out will be:\n\n${prefix.trim()}-${n + 1}\n\nSave these settings?`
    );
    if (!ok) return;
    setSaving(true);
    try {
      await updateCounter(prefix.trim(), n);
      alert('Settings saved.');
    } catch (e) {
      alert('Could not save: ' + (e.message || e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel settings-panel">
      <h2>Settings</h2>
      <p className="hint">
        Set these once when the client confirms their current loan number, and again only when the
        prefix changes (for example at the start of a new year). The system continues counting from
        the "last issued number" — it never reuses a number.
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

      <button className="btn btn-primary" onClick={handleSave} disabled={saving || !loaded}>
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  );
}
