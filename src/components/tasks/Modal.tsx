import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Con dos modales apilados (historial + editor), Escape cierra solo el de arriba.
const openModals: symbol[] = [];

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

export default function Modal({ title, onClose, children, wide = false }: ModalProps) {
  const onCloseRef = useRef(onClose);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const id = Symbol('modal');
    openModals.push(id);

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && openModals[openModals.length - 1] === id) onCloseRef.current();
    }
    document.addEventListener('keydown', handleKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKey);
      openModals.splice(openModals.indexOf(id), 1);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-che-ink/50 p-4 sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`max-h-[88vh] w-full animate-fadeIn overflow-y-auto rounded-[18px] border-2 border-che-ink bg-che-paper p-6 shadow-che-lg shadow-che-lav-soft focus:outline-none ${
          wide ? 'max-w-[640px]' : 'max-w-[480px]'
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-semibold">{title}</h3>
          <button
            type="button"
            aria-label="Cerrar"
            className="-mr-1 -mt-1 rounded-lg px-2 py-1 text-xl leading-none text-che-ink-soft transition-colors hover:bg-che-bg-2 hover:text-che-ink"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
