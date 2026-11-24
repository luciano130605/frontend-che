import { useState } from 'react';
import type { Urgency } from '../../types';
import { errorMessage } from '../../lib/api';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete03Icon, Edit01Icon } from '@hugeicons/core-free-icons';

interface RowCategory {
  label: string;
  key: string;
}

const URGENCY_BORDER: Record<Urgency, string> = {
  alta: 'border-l-4 border-l-che-coral',
  media: 'border-l-4 border-l-che-mustard',
  baja: 'border-l-4 border-l-che-lav',
};

const URGENCY_TEXT: Record<Urgency, string> = {
  alta: 'text-che-coral-dark',
  media: 'text-[#9C7B18]',
  baja: 'text-[#7A62B8]',
};

const URGENCY_DOT: Record<Urgency, string> = {
  alta: 'bg-che-coral',
  media: 'bg-[#C99A1E]',
  baja: 'bg-che-lav',
};

// Mapeo por nombre de categoría real (las 6 sembradas en el backend).
const CATEGORY_BG: Record<string, string> = {
  Finanzas: 'bg-che-coral-soft',
  Trabajo: 'bg-che-lav-soft',
  Salud: 'bg-[#F7D9D9]',
  Hogar: 'bg-che-mustard-soft',
  Personal: 'bg-[#DDEFD6]',
  Otros: 'bg-che-bg-2',
};

interface TaskRowProps {
  title: string;
  urgency?: Urgency;
  category?: RowCategory;
  time?: string;
  extra?: string;
  initialDone?: boolean;
  toggleLabel?: string;
  onToggle: () => void;
  onEdit?: () => void;
  /** Si falla, tiene que lanzar el error: la fila lo muestra y no se pierde la tarea. */
  onDelete?: () => Promise<void>;
}

function PencilIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export default function TaskRow({
  title,
  urgency,
  category,
  time,
  extra,
  initialDone = false,
  toggleLabel,
  onToggle,
  onEdit,
  onDelete,
}: TaskRowProps) {
  const done = initialDone;
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    if (!onDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await onDelete();
    } catch (err) {
      setDeleteError(errorMessage(err, 'No se pudo eliminar la tarea.'));
      setDeleting(false);
    }
  }

  const iconButton =
    'rounded-lg p-1.5 text-che-ink-soft transition-colors hover:bg-che-bg-2 hover:text-che-ink';

  return (
    <div
      className={`relative mb-3 flex items-start gap-3.5 rounded-[1.15rem] border border-che-line bg-che-paper p-4 shadow-[0_5px_15px_rgba(32,35,34,.05)] sm:rounded-[13px] sm:border-[1.5px] sm:border-che-ink sm:shadow-none ${urgency ? URGENCY_BORDER[urgency] : ''
        } ${done ? 'bg-che-bg-2 opacity-70' : 'bg-che-paper'}`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={toggleLabel ?? (done ? 'Marcar como pendiente' : 'Marcar como hecha')}
        className={`relative mt-0.5 h-6 w-6 flex-shrink-0 cursor-pointer rounded-[7px] border-2 border-che-ink transition-colors ${done
            ? "bg-che-coral after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-sm after:font-bold after:text-che-ink after:content-['✓']"
            : 'bg-che-paper hover:bg-che-coral-soft'
          }`}
        onClick={onToggle}
      />
      <div className="min-w-0 flex-1">
        <div
          className={`mb-1.5 break-words text-[0.98rem] font-semibold ${done ? 'text-che-ink-soft line-through decoration-che-coral decoration-2' : ''
            }`}
        >
          {title}
        </div>
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-che-ink-soft">
          {category && (
            <span
              className={`rounded-full border-[1.5px] border-che-ink px-2.5 py-0.5 text-[0.72rem] font-bold ${CATEGORY_BG[category.label] ?? 'bg-che-paper'}`}
            >
              {category.label}
            </span>
          )}
          {urgency && !done && (
            <span className={`flex items-center gap-1.5 font-semibold ${URGENCY_TEXT[urgency]}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${URGENCY_DOT[urgency]}`} />
              Urgencia {urgency}
            </span>
          )}
          {extra && <span>{extra}</span>}
        </div>

        {confirming && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">¿Eliminar esta tarea?</span>
            <button
              type="button"
              className="rounded-[9px] bg-che-coral-dark px-3 py-1.5 text-[0.8rem] font-bold text-che-paper transition-opacity disabled:opacity-60"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
            <button
              type="button"
              className="rounded-[9px] border-[1.5px] border-che-line px-3 py-1.5 text-[0.8rem] font-bold transition-colors hover:border-che-ink"
              onClick={() => {
                setConfirming(false);
                setDeleteError(null);
              }}
              disabled={deleting}
            >
              No
            </button>
          </div>
        )}
        {deleteError && <p className="mt-2 text-sm font-medium text-che-coral-dark">{deleteError}</p>}
      </div>

      <div className="flex flex-col items-end gap-1">
        {time && (
          <div className="whitespace-nowrap font-display text-[0.95rem] font-semibold text-che-ink">
            {time}
          </div>
        )}
        {(onEdit || onDelete) && !confirming && (
          <div className="flex items-center">
            {onEdit && (
              <button type="button" className={iconButton} aria-label="Editar tarea" title="Editar" onClick={onEdit}>
                <HugeiconsIcon icon={Edit01Icon} size={16} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className={`${iconButton} hover:text-che-coral-dark`}
                aria-label="Eliminar tarea"
                title="Eliminar"
                onClick={() => setConfirming(true)}
              >
                <HugeiconsIcon icon={Delete03Icon} size={16} />

              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
