import { useRegisterSW } from 'virtual:pwa-register/react';

/** Cuando se publica una versión nueva, el service worker queda esperando hasta que la persona acepte recargar. */
export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border-2 border-che-ink bg-che-paper p-3.5 shadow-che-lg shadow-che-ink"
    >
      <p className="flex-1 text-sm font-semibold text-che-ink">Hay una versión nueva de Che.</p>
      <button
        type="button"
        className="rounded-full px-3 py-1.5 text-xs font-semibold text-che-ink-soft hover:text-che-ink"
        onClick={() => setNeedRefresh(false)}
      >
        Después
      </button>
      <button
        type="button"
        className="rounded-full bg-che-ink px-3.5 py-1.5 text-xs font-bold text-che-bg"
        onClick={() => void updateServiceWorker(true)}
      >
        Actualizar
      </button>
    </div>
  );
}
