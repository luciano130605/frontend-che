import { useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { apiRequest, clearSession } from '../auth';

/** Cerrar sesión y eliminar la cuenta (pide la contraseña). Vive al final del perfil. */
export default function AccountActions() {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function logout() {
    clearSession();
    void navigate({ to: '/' });
  }

  function cancel() {
    setConfirming(false);
    setPassword('');
    setError('');
  }

  async function deleteAccount(event: FormEvent) {
    event.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setError('');
    try {
      await apiRequest('/profile/account', { method: 'DELETE', body: JSON.stringify({ password }) });
      clearSession();
      void navigate({ to: '/' });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo eliminar la cuenta.');
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border-2 border-che-ink bg-che-paper p-4 shadow-che-sm shadow-che-ink/10">
      <span className="block font-display text-sm sm:text-base font-bold text-che-ink">Tu cuenta</span>

      {!confirming ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-che-ink bg-che-paper px-4 py-2 text-xs font-bold text-che-ink transition-all hover:-translate-y-0.5 hover:shadow-che-sm hover:shadow-che-ink"
          >
            Cerrar sesión
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-xl border border-che-coral-dark bg-che-paper px-4 py-2 text-xs font-bold text-che-coral-dark transition-all hover:-translate-y-0.5 hover:bg-che-coral-dark hover:text-che-bg hover:shadow-che-sm hover:shadow-che-ink"
          >
            Eliminar cuenta
          </button>
        </div>
      ) : (
        <form onSubmit={(event) => void deleteAccount(event)} className="space-y-3">
          <p className="text-xs text-che-ink-soft">
            Se borran tu cuenta, tus tareas y tus avisos, y no se puede deshacer. Ingresá tu contraseña para confirmar.
          </p>
          <div>
            <label htmlFor="delete-account-password" className="mb-1 block text-xs font-bold text-che-ink-soft">Contraseña</label>
            <input
              id="delete-account-password"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border-2 border-che-line bg-che-bg px-3.5 py-2 text-sm text-che-ink focus:border-che-ink focus:outline-none"
            />
          </div>
          {error && <p role="alert" className="text-xs font-bold text-che-coral-dark">{error}</p>}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={cancel}
              disabled={busy}
              className="rounded-xl border border-che-ink bg-che-paper px-4 py-2 text-xs font-bold text-che-ink transition-all hover:-translate-y-0.5 hover:shadow-che-sm hover:shadow-che-ink disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy || !password}
              className="rounded-xl border border-che-coral-dark bg-che-coral-dark px-4 py-2 text-xs font-bold text-che-bg transition-all hover:-translate-y-0.5 hover:shadow-che-sm hover:shadow-che-ink disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {busy ? 'Eliminando…' : 'Eliminar definitivamente'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
