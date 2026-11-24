import { useEffect, useState } from 'react';
import {
  deleteTask,
  errorMessage,
  fetchHistory,
  updateTaskStatus,
  type Category,
  type Task,
} from '../../lib/api';
import { formatShortDate, formatTime, isExpired } from '../../lib/dates';
import { PRIORITY_TO_URGENCY } from '../../lib/taskUi';
import Modal from './Modal';
import TaskEditModal from './TaskEditModal';
import TaskRow from './TaskRow';

interface HistoryModalProps {
  categories: Category[];
  timeZone: string;
  onClose: () => void;
  /** Cualquier cambio hecho desde el historial (restaurar, completar, editar). */
  onTaskChanged: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

function describe(task: Task, timeZone: string): string {
  if (task.status === 'DONE') {
    return task.updatedAt ? `Resuelta el ${formatShortDate(task.updatedAt, timeZone)}` : 'Resuelta';
  }
  return task.dueDate
    ? `No se completó · venció el ${formatShortDate(task.dueDate, timeZone)}`
    : 'No se completó · sin fecha';
}

export default function HistoryModal({
  categories,
  timeZone,
  onClose,
  onTaskChanged,
  onTaskDeleted,
}: HistoryModalProps) {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHistory()
      .then((data) => {
        if (!cancelled) setTasks(data);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, 'No se pudo cargar el historial.'));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Una tarea que vuelve a ser pendiente y todavía no venció pertenece a la lista principal.
  function applyChange(updated: Task) {
    setTasks((prev) => {
      if (!prev) return prev;
      const belongsHere = updated.status === 'DONE' || isExpired(updated);
      return belongsHere
        ? prev.map((t) => (t.id === updated.id ? updated : t))
        : prev.filter((t) => t.id !== updated.id);
    });
    onTaskChanged(updated);
  }

  async function handleToggle(task: Task) {
    setError(null);
    try {
      applyChange(await updateTaskStatus(task.id, task.status === 'DONE' ? 'PENDING' : 'DONE'));
    } catch (err) {
      setError(errorMessage(err, 'No se pudo actualizar la tarea.'));
    }
  }

  async function handleDelete(task: Task) {
    await deleteTask(task.id);
    setTasks((prev) => prev?.filter((t) => t.id !== task.id) ?? prev);
    onTaskDeleted(task.id);
  }

  return (
    <>
      <Modal title="Historial de tareas" onClose={onClose} wide>
        <p className="-mt-2 mb-5 text-sm text-che-ink-soft">
          Lo que ya resolviste y lo que venció sin completarse. Tildá una tarea para devolverla a pendientes.
        </p>

        {error && <p className="mb-4 text-sm font-medium text-che-coral-dark">{error}</p>}

        {tasks === null && !error && <p className="text-che-ink-soft">Cargando historial...</p>}

        {tasks?.length === 0 && (
          <p className="rounded-[13px] border-[1.5px] border-dashed border-che-line p-6 text-center text-che-ink-soft">
            Todavía no hay nada en el historial.
          </p>
        )}

        {tasks?.map((task) => (
          <TaskRow
            key={task.id}
            title={task.title}
            urgency={task.status === 'PENDING' ? PRIORITY_TO_URGENCY[task.priority] : undefined}
            category={task.category ? { label: task.category.name, key: task.category.id } : undefined}
            time={formatTime(task.dueDate, timeZone)}
            extra={describe(task, timeZone)}
            initialDone={task.status === 'DONE'}
            toggleLabel={task.status === 'DONE' ? 'Volver a pendientes' : 'Marcar como hecha'}
            onToggle={() => handleToggle(task)}
            onEdit={() => setEditing(task)}
            onDelete={() => handleDelete(task)}
          />
        ))}
      </Modal>

      {editing && (
        <TaskEditModal
          task={editing}
          categories={categories}
          timeZone={timeZone}
          onClose={() => setEditing(null)}
          onSaved={applyChange}
        />
      )}
    </>
  );
}
