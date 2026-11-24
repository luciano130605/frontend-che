import { useEffect, useRef, useState } from 'react';
import { apiRequest, authenticate, type AuthSession } from '../auth';
import type { AuthTab } from '../types';
import { HugeiconsIcon } from '@hugeicons/react';
import { Eye, EyeClosedFreeIcons } from '@hugeicons/core-free-icons';

interface AuthViewProps {
  initialTab?: AuthTab;
  onAuthSuccess: (session: AuthSession) => void;
}

interface GoogleCredentialResponse { credential?: string }
interface GoogleIdentity {
  initialize(options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }): void;
  renderButton(element: HTMLElement, options: { theme: string; size: string; width: number; text: string; shape?: 'rectangular' | 'pill' }): void;
}
declare global {
  interface Window { google?: { accounts: { id: GoogleIdentity } } }
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function AuthView({ initialTab = 'login', onAuthSuccess }: AuthViewProps) {
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [notice, setNotice] = useState('');
  const googleButton = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!googleClientId || !googleButton.current) return;
    let active = true;
    const render = () => {
      if (!active || !window.google || !googleButton.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          if (!credential) return;
          setBusy(true);
          setError('');
          try { onAuthSuccess(await authenticate('google', { credential })); }
          catch (caught) { setError(caught instanceof Error ? caught.message : 'No se pudo ingresar con Google.'); }
          finally { setBusy(false); }
        },
      });
      googleButton.current.replaceChildren();
      window.google.accounts.id.renderButton(googleButton.current, {
        // El botón vive en un iframe de Google: no admite CSS propio, pero 'pill' lo redondea como el resto de la app.
        theme: 'outline', size: 'large', width: 340, text: 'continue_with', shape: 'pill',
      });
    };
    if (window.google) render();
    else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = render;
      script.onerror = () => { if (active) setError('No se pudo cargar el acceso con Google.'); };
      document.head.appendChild(script);
    }
    return () => { active = false; };
  }, [onAuthSuccess]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const body: Record<string, string> = tab === 'register'
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };
      onAuthSuccess(await authenticate(tab, body));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo completar el acceso.');
    } finally {
      setBusy(false);
    }
  }

  function switchTab(next: AuthTab) { setTab(next); setError(''); setNotice(''); setPassword(''); }

  if (recovering) {
    return (
      <div className="relative z-[1] mx-auto flex max-w-[1180px] animate-fadeIn justify-center px-7 pb-[110px] pt-[70px]">
        <div className="relative w-full max-w-[430px] rounded-3xl border-2 border-che-ink bg-che-paper p-9 shadow-che-xl shadow-che-coral-soft">
          <PasswordRecovery
            initialEmail={email}
            onBack={(doneEmail) => {
              setRecovering(false);
              setPassword('');
              setError('');
              if (doneEmail) { setEmail(doneEmail); setNotice('Cambiaste tu contraseña. Ya podés ingresar.'); }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-[1] mx-auto flex max-w-[1180px] animate-fadeIn justify-center px-7 pb-[110px] pt-[70px]">
      <div className="relative w-full max-w-[430px] rounded-3xl border-2 border-che-ink bg-che-paper p-9 shadow-che-xl shadow-che-coral-soft">
        <div className="mb-8 flex rounded-full border-[1.5px] border-che-ink bg-che-bg p-1">
          {(['login', 'register'] as const).map((item) => (
            <button key={item} type="button" className={`flex-1 rounded-full py-2.5 text-center text-sm font-bold ${tab === item ? 'bg-che-ink text-che-bg' : 'text-che-ink-soft'}`} onClick={() => switchTab(item)}>
              {item === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        <h2 className="mb-1.5 font-display text-2xl font-semibold">{tab === 'login' ? 'Hola de nuevo' : 'Creá tu cuenta'}</h2>
        <p className="mb-6 text-sm text-che-ink-soft">{tab === 'login' ? 'Entrá para ver tu semana organizada.' : 'Un minuto y empezás a organizar tu semana.'}</p>
        <form onSubmit={submit}>
          {tab === 'register' && <Field label="Nombre" type="text" value={name} onChange={setName} placeholder="Tu nombre" autoComplete="name" />}
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="vos@email.com" autoComplete="email" required />
          <Field label="Contraseña" type="password" value={password} onChange={setPassword} placeholder={tab === 'register' ? 'Mínimo 8 caracteres' : 'Tu contraseña'} autoComplete={tab === 'register' ? 'new-password' : 'current-password'} minLength={tab === 'register' ? 8 : 1} required />
          {tab === 'login' && (
            <div className="-mt-2 mb-4 text-right">
              <button type="button" className="text-sm font-bold text-che-coral-dark hover:underline" onClick={() => { setError(''); setNotice(''); setRecovering(true); }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}
          {notice && <p role="status" className="mb-3 text-sm font-bold text-emerald-700">{notice}</p>}
          {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className={`
    group relative inline-flex items-center gap-1.5 justify-center
                                        overflow-hidden rounded-xl border border-che-ink bg-che-ink
                                        font-semibold text-che-bg
                                        transition-all duration-300 ease-out
                                        hover:-translate-y-0.5 hover:bg-che-coral-dark
                                        hover:border-che-coral-dark
                                        hover:shadow-che-sm hover:shadow-che-ink
                                        active:translate-y-0 active:shadow-none
                                        p-2
                                        w-full
  `}
          >
            <span className="relative z-10">
              {busy
                ? 'Un momento…'
                : tab === 'login'
                  ? 'Ingresar'
                  : 'Crear cuenta'}
            </span>

            <span
              aria-hidden="true"
              className="
      pointer-events-none absolute inset-0
      -translate-x-full bg-che-coral
      transition-transform duration-300 ease-out
      group-hover:translate-x-0
      group-disabled:-translate-x-full
    "
            />
          </button>

        </form>

        {googleClientId && <>
          <p className="my-5 text-center text-sm text-che-ink-soft">o continuá con</p>
          <div ref={googleButton} className="flex justify-center" aria-label="Continuar con Google" />
        </>}
        <p className="mt-5 text-center text-sm text-che-ink-soft">
          {tab === 'login' ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
          <button type="button" className="font-bold text-che-coral-dark" onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}>
            {tab === 'login' ? 'Creá una gratis' : 'Ingresá'}
          </button>
        </p>
      </div>
    </div>
  );
}

const RESEND_COOLDOWN_SECONDS = 60;

const primaryButtonClass = `group relative inline-flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-xl border border-che-ink bg-che-ink p-2 font-semibold text-che-bg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-che-coral-dark hover:bg-che-coral-dark hover:shadow-che-sm hover:shadow-che-ink active:translate-y-0 active:shadow-none disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none`;

/** Recuperar contraseña: 1) el email recibe un código de 6 números, 2) código + contraseña nueva. */
function PasswordRecovery({ initialEmail, onBack }: { initialEmail: string; onBack: (changedEmail?: string) => void }) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function sendCode(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (busy || cooldown > 0) return;
    setBusy(true); setError(''); setInfo('');
    try {
      const result = await apiRequest<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      setInfo(result.message);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setStep('code');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo enviar el código.');
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(''); setInfo('');
    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), code, password }),
      });
      onBack(email.trim());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cambiar la contraseña.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h2 className="mb-1.5 font-display text-2xl font-semibold">Recuperá tu contraseña</h2>
      <p className="mb-6 text-sm text-che-ink-soft">
        {step === 'email'
          ? 'Ingresá tu email y te mandamos un código de 6 números.'
          : <>Si <b className="text-che-ink">{email.trim()}</b> tiene una cuenta, te llegó un código. Revisá también la carpeta de spam.</>}
      </p>

      {step === 'email' ? (
        <form onSubmit={(event) => void sendCode(event)}>
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="vos@email.com" autoComplete="email" required />
          {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className={primaryButtonClass}>{busy ? 'Enviando…' : 'Enviarme el código'}</button>
        </form>
      ) : (
        <form onSubmit={(event) => void changePassword(event)}>
          <label className="mb-4 block text-sm font-bold">
            Código
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              required
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              className="mt-1.5 block w-full rounded-[10px] border-[1.5px] border-che-line bg-che-bg px-3.5 py-3 text-center font-mono text-base font-normal tracking-[0.3em] text-che-ink focus:border-che-coral focus:outline-none"
            />
          </label>
          <Field label="Nueva contraseña" type="password" value={password} onChange={setPassword} placeholder="Mínimo 8 caracteres" autoComplete="new-password" minLength={8} required />
          {info && <p role="status" className="mb-3 text-sm text-che-ink-soft">{info}</p>}
          {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy || code.length !== 6 || password.length < 8} className={primaryButtonClass}>{busy ? 'Un momento…' : 'Cambiar contraseña'}</button>
          <p className="mt-4 text-center text-sm text-che-ink-soft">
            ¿No te llegó?{' '}
            <button type="button" disabled={busy || cooldown > 0} onClick={() => void sendCode()} className="font-bold text-che-coral-dark disabled:opacity-60">
              {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar código'}
            </button>
          </p>
        </form>
      )}

      <p className="mt-5 text-center text-sm text-che-ink-soft">
        <button type="button" className="font-bold text-che-coral-dark" onClick={() => onBack()}>Volver a ingresar</button>
      </p>
    </>
  );
}

interface FieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  required?: boolean;
  minLength?: number;
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
}: FieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';

  return (
    <label className="mb-4 block text-sm font-bold">
      {label}

      <div className="relative mt-1.5">
        <input
          type={isPassword && showPassword ? 'text' : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className={`block w-full rounded-[10px] border-[1.5px] border-che-line bg-che-bg px-3.5 py-3 font-sans text-sm font-normal text-che-ink focus:border-che-coral focus:outline-none ${isPassword ? 'pr-12' : ''
            }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-3 flex items-center justify-center text-che-ink/50 transition-colors hover:text-che-coral focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-che-coral"
          >
            {showPassword ? (
              <HugeiconsIcon icon={EyeClosedFreeIcons} size={19} strokeWidth={1.8} />
            ) : (
              <HugeiconsIcon icon={Eye} size={19} strokeWidth={1.8} />
            )}
          </button>
        )}
      </div>
    </label>
  );
}