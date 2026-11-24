import { useEffect, useState } from 'react';

// Chrome/Edge/Android disparan este evento cuando la app es instalable; iOS no lo soporta.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'che.install-dismissed';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIosSafari() {
  const ua = navigator.userAgent;
  const ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return ios && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
}

function wasDismissed() {
  try { return localStorage.getItem(DISMISSED_KEY) === '1'; } catch { return false; }
}

export default function InstallBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(() => isStandalone() || wasDismissed());
  const showIosHint = !hidden && !installEvent && isIosSafari();

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault(); // mostramos nuestro banner en vez del mini-infobar del navegador
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  function dismiss() {
    setHidden(true);
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch { /* modo privado: solo se oculta por esta vez */ }
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallEvent(null);
    if (outcome === 'accepted') setHidden(true);
  }

  if (hidden || (!installEvent && !showIosHint)) return null;

  return (
    <div className="flex items-center gap-3 rounded-[18px] border-2 border-che-ink bg-che-coral-soft p-4">
      <img src="/pwa-64x64.png" alt="" className="h-10 w-10 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-che-ink">Tené a Che en tu celular</p>
        <p className="text-xs text-che-ink-soft">
          {installEvent
            ? 'Instalala y abrila como cualquier app, sin pasar por el navegador.'
            : 'En Safari, tocá Compartir y después "Agregar a inicio".'}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
        {installEvent && (
          <button type="button" className="rounded-full bg-che-ink px-3.5 py-1.5 text-xs font-bold text-che-bg" onClick={() => void install()}>
            Instalar
          </button>
        )}
        <button type="button" className="rounded-full px-3 py-1.5 text-xs font-semibold text-che-ink-soft hover:text-che-ink" onClick={dismiss}>
          Ahora no
        </button>
      </div>
    </div>
  );
}
