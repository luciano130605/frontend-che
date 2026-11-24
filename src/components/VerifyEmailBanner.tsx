import { useEffect, useState, type FormEvent } from 'react';
import { apiRequest, updateSessionUser, useSession, type AuthUser } from '../auth';

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Aviso para verificar el email con el código que llega al registrarse.
 * Hasta verificar se puede usar la app, pero no la IA (así no se renueva el plan gratis con cuentas nuevas).
 */
export default function VerifyEmailBanner() {
  const session = useSession();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState<'verify' | 'resend' | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [justVerified, setJustVerified] = useState(false);

  // Trae el estado real: puede haber verificado en otra pestaña, o ser una sesión guardada antes de este cambio.
  useEffect(() => {
    apiRequest<{ user: AuthUser }>('/auth/me')
      .then(({ user }) => updateSessionUser({ emailVerified: user.emailVerified }))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function verify(event: FormEvent) {
    event.preventDefault();
    if (code.length !== 6 || busy) return;
    setBusy('verify');
    setMessage(null);
    try {
      const { user } = await apiRequest<{ user: AuthUser }>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      setJustVerified(true);
      updateSessionUser({ emailVerified: user.emailVerified });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'No se pudo verificar.', error: true });
    } finally {
      setBusy(null);
    }
  }

  async function resend() {
    if (busy || cooldown > 0) return;
    setBusy('resend');
    setMessage(null);
    try {
      const result = await apiRequest<{ message: string }>('/auth/resend-verification', { method: 'POST' });
      setMessage({ text: result.message });
      setCode('');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'No se pudo reenviar el código.', error: true });
    } finally {
      setBusy(null);
    }
  }

  if (justVerified) {
    return (
      <div role="status" className="rounded-[18px] border-2 border-che-ink bg-che-lav-soft p-4 text-sm font-bold text-che-ink">
        ¡Listo! Tu email quedó verificado y ya podés usar la IA.
      </div>
    );
  }

  if (session?.user.emailVerified !== false) return null;

  return (
    <div className="rounded-[18px] border-2 border-che-ink bg-che-mustard-soft p-4">
      <p className="text-sm font-bold text-che-ink">Verificá tu email para usar la IA</p>
      <p className="text-xs text-che-ink-soft">
        Te mandamos un código de 6 números a <b className="text-che-ink">{session.user.email}</b>. Revisá también la carpeta de spam.
      </p>

      <form onSubmit={(event) => void verify(event)} className="mt-3 flex flex-wrap items-center gap-2">
        <label htmlFor="verify-email-code" className="sr-only">Código de verificación</label>
        <input
          id="verify-email-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-32 rounded-xl border-[1.5px] border-che-line bg-che-paper px-3 py-2 text-center font-mono text-base tracking-[0.3em] text-che-ink focus:border-che-coral focus:outline-none"
        />
        <button
          type="submit"
          disabled={code.length !== 6 || busy !== null}
          className="rounded-xl border border-che-ink bg-che-ink px-4 py-2 text-xs font-bold text-che-bg transition-all hover:-translate-y-0.5 hover:shadow-che-sm hover:shadow-che-ink disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {busy === 'verify' ? 'Verificando…' : 'Verificar'}
        </button>
        <button
          type="button"
          onClick={() => void resend()}
          disabled={busy !== null || cooldown > 0}
          className="rounded-xl px-3 py-2 text-xs font-semibold text-che-ink-soft hover:text-che-ink disabled:opacity-60"
        >
          {busy === 'resend' ? 'Enviando…' : cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar código'}
        </button>
      </form>

      {message && (
        <p role="status" className={`mt-2 text-xs ${message.error ? 'font-bold text-che-coral-dark' : 'text-che-ink-soft'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
