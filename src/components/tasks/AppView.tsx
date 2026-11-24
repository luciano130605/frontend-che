import { useCallback, useEffect, useState } from 'react';
import TaskComposer from './TaskComposer';
import TaskList from './TaskList';
import {
  errorMessage,
  fetchCategories,
  fetchTasks,
  getProfile,
  type Category,
  type Task,
} from '../../lib/api';
import { DEFAULT_TIME_ZONE } from '../../lib/dates';
import InstallBanner from '../pwa/InstallBanner';
import VerifyEmailBanner from '../VerifyEmailBanner';

export default function AppView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [timeZone, setTimeZone] = useState(DEFAULT_TIME_ZONE);

  const loadTasks = useCallback(async () => {
    setLoadError(null);
    try {
      // upcoming: lo vencido y lo resuelto se ve en el historial, no acá.
      setTasks(await fetchTasks({ upcoming: true }));
    } catch (err) {
      setLoadError(errorMessage(err, 'No se pudieron cargar las tareas.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();

    // Categorías y zona horaria son comodidades: si fallan, la pantalla sigue andando.
    fetchCategories()
      .then(setCategories)
      .catch(() => {});
    getProfile()
      .then((profile) => setTimeZone(profile.timeZone))
      .catch(() => {});
  }, [loadTasks]);

  function handleTasksCreated(newTasks: Task[]) {
    setTasks((prev) => [...newTasks, ...prev]);
  }

  function handleTaskUpdated(updated: Task) {
    setTasks((prev) =>
      prev.some((t) => t.id === updated.id)
        ? prev.map((t) => (t.id === updated.id ? updated : t))
        : [updated, ...prev],
    );
  }

  function handleTaskDeleted(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  return (
    <>

    {/* Avisos de arriba (verificar email, instalar la PWA): solo aparecen si corresponde; vacío, no ocupa lugar. */}
    <div className="relative z-[1] mx-auto max-w-[1180px] space-y-3 px-7 pt-6 empty:hidden">
      <VerifyEmailBanner />

      <InstallBanner />
    </div>
    <div className="relative z-[1] mx-auto grid max-w-[1180px] animate-fadeIn gap-5 px-4 pb-28 pt-5 sm:gap-7 sm:px-7 sm:pt-9 md:grid-cols-[340px_minmax(0,1fr)]">
      <TaskComposer onTasksCreated={handleTasksCreated} />
      <TaskList
        tasks={tasks}
        loading={loading}
        loadError={loadError}
        onRetry={loadTasks}
        categories={categories}
        timeZone={timeZone}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />
    </div>
    </>
  );
}
