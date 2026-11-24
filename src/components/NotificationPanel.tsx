import { useEffect, useState } from 'react';
import { apiRequest } from '../auth';

interface Settings { quietHoursStart: string | null; quietHoursEnd: string | null }

export default function NotificationPanel() {
  const [settings, setSettings] = useState<Settings>({ quietHoursStart: null, quietHoursEnd: null });
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const result = await apiRequest<{ settings: Settings | null }>('/notifications/settings');
    if (result.settings) {
      setSettings({ quietHoursStart: result.settings.quietHoursStart, quietHoursEnd: result.settings.quietHoursEnd });
    }
  }
  // Remote settings are intentionally loaded once when this authenticated panel mounts.
  // oxlint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load().catch(() => setMessage({ text: 'No se pudo cargar la configuración.', error: true })); }, []);

  async function save() {
    setSaving(true); setMessage(null);
    try {
      const { quietHoursStart, quietHoursEnd } = settings;
      const result = await apiRequest<{ settings: Settings | null }>('/notifications/settings', { method: 'PATCH', body: JSON.stringify({ quietHoursStart, quietHoursEnd }) });
      if (result.settings) setSettings({ quietHoursStart: result.settings.quietHoursStart, quietHoursEnd: result.settings.quietHoursEnd });
      setMessage({ text: 'Horario guardado.' });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'No se pudo completar la operación.', error: true });
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'w-full rounded-xl border-2 border-che-line bg-che-bg px-3.5 py-2 text-sm text-che-ink focus:border-che-ink focus:outline-none';

  return <div className="space-y-3 rounded-2xl border-2 border-che-ink bg-che-paper p-4 shadow-che-sm shadow-che-ink/10">
    <div>
      <span className="block font-display text-sm sm:text-base font-bold text-che-ink">No molestar</span>
      <p className="text-xs text-che-ink-soft">Pausa los recordatorios, no el resumen diario.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label htmlFor="quietHoursStart" className="block text-xs font-bold text-che-ink-soft mb-1">Desde</label>
        <input id="quietHoursStart" type="time" className={inputClass} value={settings.quietHoursStart ?? ''} onChange={(e) => setSettings({ ...settings, quietHoursStart: e.target.value || null })} />
      </div>
      <div>
        <label htmlFor="quietHoursEnd" className="block text-xs font-bold text-che-ink-soft mb-1">Hasta</label>
        <input id="quietHoursEnd" type="time" className={inputClass} value={settings.quietHoursEnd ?? ''} onChange={(e) => setSettings({ ...settings, quietHoursEnd: e.target.value || null })} />
      </div>
    </div>

    {message && <p role="status" className={`text-xs font-bold ${message.error ? 'text-che-coral-dark' : 'text-emerald-700'}`}>{message.error ? message.text : `✓ ${message.text}`}</p>}

    <div className="flex justify-end pt-1">
      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="rounded-xl border border-che-ink bg-che-ink px-4 py-2 text-xs font-bold text-che-bg transition-all hover:-translate-y-0.5 hover:bg-che-coral-dark hover:shadow-che-sm hover:shadow-che-ink disabled:opacity-50"
      >
        {saving ? 'Guardando…' : 'Guardar horario'}
      </button>
    </div>
  </div>;
}
