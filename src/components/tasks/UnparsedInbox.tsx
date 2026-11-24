import { useEffect, useState } from 'react';
import {
  confirmInterpretation,
  deleteUnparsed,
  errorMessage,
  fetchUnparsed,
  retryUnparsed,
  saveUnparsedAsTask,
  type Task,
  type UnparsedItem,
} from '../../lib/api';

interface UnparsedInboxProps {
  /** Cambia cuando hay que volver a consultar (por ejemplo, después de un texto que la IA no entendió). */
  refreshKey: number;
  onTasksCreated: (tasks: Task[]) => void;
}

type Action = 'retry' | 'save' | 'delete';

// Textos que la IA no pudo interpretar (desde la app o desde Telegram): se guardan para no perderlos.
// Solo se muestra si hay alguno.
export default function UnparsedInbox({ refreshKey, onTasksCreated }: UnparsedInboxProps) {
  const [items, setItems] = useState<UnparsedItem[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchUnparsed()
      .then(({ items: fresh }) => { if (active) setItems(fresh); })
      .catch(() => { /* la bandeja es secundaria: si falla, el composer sigue andando */ });
    return () => { active = false; };
  }, [refreshKey]);

  const removeItem = (id: string) => setItems((current) => current.filter((item) => item.id !== id));

  async function handle(item: UnparsedItem, action: Action) {
    setBusyId(item.id);
    setMessage(null);
    try {
      if (action === 'retry') {
        const result = await retryUnparsed(item.id);
        if (result.status === 'FAILED') {
          setMessage(result.message);
          return;
        }
        const { tasks } = await confirmInterpretation(result.interpretationId, result.tasks);
        removeItem(item.id);
        onTasksCreated(tasks);
      } else if (action === 'save') {
        const { task } = await saveUnparsedAsTask(item.id);
        removeItem(item.id);
        onTasksCreated([task]);
      } else {
        await deleteUnparsed(item.id);
        removeItem(item.id);
      }
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) return null;

  const button =
    'rounded-[9px] border-[1.5px] border-che-ink px-2.5 py-1 text-xs font-bold text-che-ink transition-colors hover:bg-che-coral-soft disabled:opacity-60';

  return (
    <div className="mt-4 border-t-[1.5px] border-dashed border-che-line pt-4">
      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-che-ink-soft">
        Sin interpretar ({items.length})
      </div>
      <p className="mb-2 text-xs text-che-ink-soft">No los entendí, pero los guardé para que no se pierdan.</p>
      {items.map((item) => (
        <div key={item.id} className="mb-1.5 rounded-[9px] border-[1.5px] border-che-line bg-che-bg px-2.5 py-2">
          <p className="whitespace-pre-wrap text-sm text-che-ink">{item.originalText}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button type="button" className={button} disabled={busyId === item.id} onClick={() => void handle(item, 'retry')}>
              {busyId === item.id ? '…' : 'Reintentar'}
            </button>
            <button type="button" className={button} disabled={busyId === item.id} onClick={() => void handle(item, 'save')}>
              Guardar tal cual
            </button>
            <button
              type="button"
              className="rounded-[9px] px-2.5 py-1 text-xs font-bold text-che-ink-soft hover:text-che-ink disabled:opacity-60"
              disabled={busyId === item.id}
              onClick={() => void handle(item, 'delete')}
            >
              Descartar
            </button>
          </div>
        </div>
      ))}
      {message && <p className="mt-2 text-sm font-medium text-che-coral-dark">{message}</p>}
    </div>
  );
}
