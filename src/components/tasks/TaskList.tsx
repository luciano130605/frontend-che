import { useEffect, useState } from 'react';
import {
  deleteTask,
  errorMessage,
  updateTaskStatus,
  type Category,
  type Task,
} from '../../lib/api';
import { formatDayLabel, formatTime, isExpired, dateKey, todayKey } from '../../lib/dates';
import { PRIORITY_TO_URGENCY, compareByDueDate } from '../../lib/taskUi';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import HistoryModal from './HistoryModal';
import TaskCalendar from './TaskCalendar';
import TaskEditModal from './TaskEditModal';
import TaskRow from './TaskRow';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  loadError: string | null;
  onRetry: () => void;
  categories: Category[];
  timeZone: string;
  /** Crea o reemplaza la tarea en el estado de la pantalla. */
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

type View = 'list' | 'calendar';

const VIEW_STORAGE_KEY = 'che.tasksView';
const UNDO_VISIBLE_MS = 6000;

function readStoredView(): View {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === 'calendar' ? 'calendar' : 'list';
  } catch {
    return 'list';
  }
}

export default function TaskList({
  tasks,
  loading,
  loadError,
  onRetry,
  categories,
  timeZone,
  onTaskUpdated,
  onTaskDeleted,
}: TaskListProps) {
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [storedView, setStoredView] = useState<View>(readStoredView);
  const [editing, setEditing] = useState<Task | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [undoTask, setUndoTask] = useState<Task | null>(null);

  // El calendario necesita ancho: en pantallas chicas se queda la lista.
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const view: View = isDesktop ? storedView : 'list';

  useEffect(() => {
    if (!undoTask) return;
    const timer = setTimeout(() => setUndoTask(null), UNDO_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [undoTask]);

  function changeView(next: View) {
    setStoredView(next);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // sin localStorage la vista simplemente no se recuerda
    }
  }

  // Los hechos y los vencidos viven en el historial, no en la lista principal.
  const active = tasks.filter((t) => t.status === 'PENDING' && !isExpired(t)).sort(compareByDueDate);

  const categoryNames = Array.from(
    new Set(active.map((t) => t.category?.name).filter((name): name is string => Boolean(name))),
  );
  const filters = ['Todas', ...categoryNames];
  const currentFilter = filters.includes(activeFilter) ? activeFilter : 'Todas';
  const visible = currentFilter === 'Todas' ? active : active.filter((t) => t.category?.name === currentFilter);

  const today = todayKey(timeZone);
  const groups = new Map<string, Task[]>();
  for (const task of visible) {
    const key = task.dueDate ? dateKey(new Date(task.dueDate), timeZone) : 'sin-fecha';
    groups.set(key, [...(groups.get(key) ?? []), task]);
  }

  const mostUrgent = active.find((t) => t.priority === 'HIGH') ?? active[0];

  async function handleToggleDone(task: Task) {
    setActionError(null);
    try {
      const updated = await updateTaskStatus(task.id, 'DONE');
      onTaskUpdated(updated);
      setUndoTask(updated);
    } catch (err) {
      setActionError(errorMessage(err, 'No se pudo actualizar la tarea.'));
    }
  }

  async function handleUndo() {
    if (!undoTask) return;
    const task = undoTask;
    setUndoTask(null);
    try {
      onTaskUpdated(await updateTaskStatus(task.id, 'PENDING'));
    } catch (err) {
      setActionError(errorMessage(err, 'No se pudo deshacer.'));
    }
  }

  async function handleDelete(task: Task) {
    await deleteTask(task.id); // si falla, la fila muestra el error
    onTaskDeleted(task.id);
  }

  function renderTask(task: Task) {
    return (
      <TaskRow
        key={task.id}
        title={task.title}
        urgency={PRIORITY_TO_URGENCY[task.priority]}
        category={task.category ? { label: task.category.name, key: task.category.id } : undefined}
        time={formatTime(task.dueDate, timeZone)}
        onToggle={() => handleToggleDone(task)}
        onEdit={() => setEditing(task)}
        onDelete={() => handleDelete(task)}
      />
    );
  }

  if (loading) {
    return <div className="text-che-ink-soft">Cargando tus tareas...</div>;
  }

  const pill = (isActive: boolean) =>
    `rounded-xl border-[1.5px] border-che-ink px-4 py-2 text-[0.82rem] font-semibold transition-colors ${
      isActive ? 'bg-che-ink text-che-bg' : 'bg-che-paper text-che-ink hover:bg-che-bg-2'
    }`;

  return (
    <div>
      <div className="relative mb-5 overflow-hidden rounded-[1.5rem] bg-che-ink px-5 py-5 text-che-bg after:absolute after:right-5 after:top-5 after:text-4xl after:opacity-10 after:content-['✎'] sm:mb-6 sm:rounded-[18px] sm:px-7 sm:py-6">
        <div className="mb-2.5 text-xs font-bold uppercase tracking-wide text-che-mustard">
          Tu brief de hoy
        </div>
        <h2 className="font-display text-xl font-medium leading-relaxed">
          {active.length === 0 ? (
            'No tenés tareas pendientes. Buen momento para escribir algo nuevo.'
          ) : (
            <>
              Tenés{' '}
              <span className="font-hand text-[1.3em] font-bold text-che-coral">
                {active.length} {active.length === 1 ? 'cosa' : 'cosas'}
              </span>{' '}
              pendientes.
              {mostUrgent && ` La más urgente: ${mostUrgent.title.toLowerCase()}.`}
            </>
          )}
        </h2>
      </div>

      {loadError && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[13px] border-[1.5px] border-che-coral bg-che-coral-soft px-4 py-3 text-sm">
          <span className="font-medium">{loadError}</span>
          <button
            type="button"
            className="rounded-[9px] bg-che-ink px-3 py-1.5 text-[0.8rem] font-bold text-che-bg transition-colors hover:bg-che-coral-dark"
            onClick={onRetry}
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
        <div className="-mx-4 flex w-[calc(100%+2rem)] snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:w-auto sm:flex-wrap sm:px-0">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`${pill(currentFilter === filter)} shrink-0 snap-start min-h-11 active:scale-[.98]`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isDesktop && (
            <div className="flex overflow-hidden rounded-xl border-[1.5px] border-che-ink" role="group" aria-label="Vista">
              {(['list', 'calendar'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={view === option}
                  className={`px-4 py-2 text-[0.82rem] font-semibold transition-colors ${
                    view === option ? 'bg-che-ink text-che-bg' : 'bg-che-paper text-che-ink hover:bg-che-bg-2'
                  }`}
                  onClick={() => changeView(option)}
                >
                  {option === 'list' ? 'Lista' : 'Calendario'}
                </button>
              ))}
            </div>
          )}
          <button type="button" className={pill(false)} onClick={() => setHistoryOpen(true)}>
            Historial
          </button>
        </div>
      </div>

      {actionError && <p className="mb-4 text-sm font-medium text-che-coral-dark">{actionError}</p>}

      {view === 'calendar' ? (
        <TaskCalendar tasks={visible} timeZone={timeZone} renderTask={renderTask} />
      ) : (
        <>
          {visible.length === 0 && (
            <p className="text-che-ink-soft">
              {active.length === 0
                ? 'Todavía no hay tareas. Contale algo a Che en el panel de la izquierda.'
                : 'No hay tareas pendientes en esta categoría.'}
            </p>
          )}

          {Array.from(groups.entries()).map(([key, group]) => (
            <div key={key}>
              <div className="my-7 mb-4 flex items-baseline gap-3.5">
                <h3 className="font-display text-lg font-semibold">
                  {formatDayLabel(key === 'sin-fecha' ? null : key, today)}
                </h3>
                <div className="h-[1.5px] flex-1 bg-[repeating-linear-gradient(90deg,#22301F_0,#22301F_4px,transparent_4px,transparent_9px)] opacity-35" />
              </div>
              {group.map(renderTask)}
            </div>
          ))}
        </>
      )}

      {undoTask && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-[12px] border-2 border-che-ink bg-che-ink px-5 py-3 text-sm text-che-bg shadow-che-lg shadow-che-lav-soft"
        >
          <span>Tarea completada. Ahora está en el historial.</span>
          <button type="button" className="font-bold text-che-mustard hover:underline" onClick={handleUndo}>
            Deshacer
          </button>
        </div>
      )}

      {editing && (
        <TaskEditModal
          task={editing}
          categories={categories}
          timeZone={timeZone}
          onClose={() => setEditing(null)}
          onSaved={onTaskUpdated}
        />
      )}

      {historyOpen && (
        <HistoryModal
          categories={categories}
          timeZone={timeZone}
          onClose={() => setHistoryOpen(false)}
          onTaskChanged={onTaskUpdated}
          onTaskDeleted={onTaskDeleted}
        />
      )}
    </div>
  );
}
