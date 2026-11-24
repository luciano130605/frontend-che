import { useMemo, useState, type FormEvent } from 'react';
import {
  errorMessage,
  updateTask,
  type Category,
  type Task,
  type TaskChanges,
} from '../../lib/api';
import { addDaysToKey, dueDateToInputs, inputsToDueDate, todayKey } from '../../lib/dates';
import Modal from './Modal';

interface TaskEditModalProps {
  task: Task;
  categories: Category[];
  timeZone: string;
  onClose: () => void;
  onSaved: (task: Task) => void;
}

const PRIORITIES: { value: Task['priority']; label: string; active: string }[] = [
  { value: 'HIGH', label: 'Alta', active: 'bg-che-coral text-che-ink' },
  { value: 'MEDIUM', label: 'Media', active: 'bg-che-mustard text-che-ink' },
  { value: 'LOW', label: 'Baja', active: 'bg-che-lav text-che-ink' },
];

const FIELD =
  'w-full rounded-[11px] border-[1.5px] border-che-line bg-che-bg px-3.5 py-2.5 font-sans text-sm text-che-ink transition-colors focus:border-che-coral focus:outline-none disabled:opacity-50';
const LABEL = 'mb-1.5 block text-xs font-bold uppercase tracking-wide text-che-ink-soft';
const QUICK = 'rounded-full border-[1.5px] border-che-line px-3 py-1 text-xs font-semibold transition-colors hover:border-che-ink';

export default function TaskEditModal({ task, categories, timeZone, onClose, onSaved }: TaskEditModalProps) {
  const initial = useMemo(() => dueDateToInputs(task.dueDate, timeZone), [task.dueDate, timeZone]);

  const [title, setTitle] = useState(task.title);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [categoryId, setCategoryId] = useState(task.category?.id ?? '');
  const [priority, setPriority] = useState<Task['priority']>(task.priority);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si las categorías no cargaron, igual mostramos la actual para no perderla al guardar.
  const categoryOptions =
    task.category && !categories.some((c) => c.id === task.category!.id)
      ? [...categories, { id: task.category.id, name: task.category.name, color: task.category.color }]
      : categories;

  function setQuickDate(offset: number) {
    setDate(addDaysToKey(todayKey(timeZone), offset));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;

    const cleanTitle = title.trim();
    if (!cleanTitle) return setError('El título no puede quedar vacío.');
    if (time && !date) return setError('Elegí una fecha para esa hora, o borrá la hora.');

    // Solo mandamos lo que cambió. Reenviar la fecha sin cambios reprogramaría el aviso
    // y volvería a notificar una tarea que ya avisó.
    const changes: TaskChanges = {};
    if (cleanTitle !== task.title) changes.title = cleanTitle;
    if ((task.category?.id ?? '') !== categoryId) changes.categoryId = categoryId || null;
    if (priority !== task.priority) changes.priority = priority;
    if (date !== initial.date || time !== initial.time) changes.dueDate = inputsToDueDate(date, time);

    if (Object.keys(changes).length === 0) return onClose();

    setSaving(true);
    setError(null);
    try {
      const updated = await updateTask(task.id, changes);
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(errorMessage(err, 'No se pudo guardar la tarea.'));
      setSaving(false);
    }
  }

  return (
    <Modal title="Editar tarea" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={LABEL} htmlFor="edit-title">
            Título
          </label>
          <input
            id="edit-title"
            className={FIELD}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            autoFocus
          />
          {task.rawText && task.rawText !== task.title && (
            <p className="mt-1.5 text-xs text-che-ink-soft">Lo que escribiste: “{task.rawText}”</p>
          )}
        </div>

        <div>
          <span className={LABEL}>Cuándo</span>
          <div className="mb-2 flex flex-wrap gap-2">
            <button type="button" className={QUICK} onClick={() => setQuickDate(0)}>
              Hoy
            </button>
            <button type="button" className={QUICK} onClick={() => setQuickDate(1)}>
              Mañana
            </button>
            <button
              type="button"
              className={QUICK}
              onClick={() => {
                setDate('');
                setTime('');
              }}
            >
              Sin fecha
            </button>
          </div>
          <div className="grid grid-cols-[1fr_130px] gap-2.5">
            <input
              type="date"
              aria-label="Fecha"
              className={FIELD}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <input
              type="time"
              aria-label="Hora (opcional)"
              className={FIELD}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={!date}
            />
          </div>
          <p className="mt-1.5 text-xs text-che-ink-soft">
            Sin hora = tarea de todo el día. Con hora, Che te avisa antes (plan pago).
          </p>
        </div>

        <div>
          <label className={LABEL} htmlFor="edit-category">
            Categoría
          </label>
          <select
            id="edit-category"
            className={FIELD}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Sin categoría</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={LABEL}>Urgencia</span>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITIES.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={priority === option.value}
                className={`rounded-[10px] border-[1.5px] border-che-ink px-3 py-2 text-sm font-semibold transition-colors ${
                  priority === option.value ? option.active : 'bg-che-paper text-che-ink hover:bg-che-bg-2'
                }`}
                onClick={() => setPriority(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm font-medium text-che-coral-dark">{error}</p>}

        <div className="flex justify-end gap-2.5 pt-1">
          <button
            type="button"
            className="rounded-[10px] border-2 border-che-line px-4 py-2.5 text-sm font-bold transition-colors hover:border-che-ink"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-[10px] bg-che-ink px-5 py-2.5 text-sm font-bold text-che-bg transition-colors hover:bg-che-coral-dark disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
