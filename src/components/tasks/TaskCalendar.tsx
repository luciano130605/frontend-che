import { useMemo, useState, type ReactNode } from 'react';
import type { Task } from '../../lib/api';
import {
  addDaysToKey,
  dateKey,
  formatTime,
  longDayLabel,
  monthTitle,
  todayKey,
} from '../../lib/dates';
import { PRIORITY_TO_URGENCY } from '../../lib/taskUi';
import { HugeiconsIcon } from '@hugeicons/react';
import { ChevronLeft, ChevronRight } from '@hugeicons/core-free-icons';

interface TaskCalendarProps {
  /** Solo las tareas pendientes que se están mostrando (ya filtradas por categoría). */
  tasks: Task[];
  timeZone: string;
  /** La fila de una tarea, la misma que usa la vista de lista. */
  renderTask: (task: Task) => ReactNode;
}

const WEEKDAY_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MAX_CHIPS = 3;

const CHIP_STYLE = {
  alta: 'border-l-che-coral bg-che-coral-soft',
  media: 'border-l-che-mustard bg-che-mustard-soft',
  baja: 'border-l-che-lav bg-che-lav-soft',
} as const;

function buildWeeks(year: number, month: number): string[][] {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7; // la semana arranca el lunes
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const weekCount = Math.ceil((offset + daysInMonth) / 7);
  const startKey = first.toISOString().slice(0, 10);

  return Array.from({ length: weekCount }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDaysToKey(startKey, week * 7 + day - offset)),
  );
}

export default function TaskCalendar({ tasks, timeZone, renderTask }: TaskCalendarProps) {
  const today = todayKey(timeZone);
  const [cursor, setCursor] = useState(() => ({
    year: Number(today.slice(0, 4)),
    month: Number(today.slice(5, 7)) - 1,
  }));
  const [selected, setSelected] = useState(today);

  const { byDay, undated } = useMemo(() => {
    const map = new Map<string, Task[]>();
    const noDate: Task[] = [];
    for (const task of tasks) {
      if (!task.dueDate) {
        noDate.push(task);
        continue;
      }
      const key = dateKey(new Date(task.dueDate), timeZone);
      map.set(key, [...(map.get(key) ?? []), task]);
    }
    return { byDay: map, undated: noDate };
  }, [tasks, timeZone]);

  const weeks = buildWeeks(cursor.year, cursor.month);

  function goToMonth(delta: number) {
    setCursor((prev) => {
      const date = new Date(Date.UTC(prev.year, prev.month + delta, 1));
      return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
    });
  }

  function goToToday() {
    setCursor({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 });
    setSelected(today);
  }

  const selectedTasks = byDay.get(selected) ?? [];
  const navButton =
    'rounded-[9px] border-[1.5px] border-che-ink bg-che-paper px-3 py-1.5 text-sm font-bold transition-colors hover:bg-che-bg-2';

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-xl font-semibold capitalize">
          {monthTitle(cursor.year, cursor.month)}
        </h3>
        <div className="flex items-center gap-2">
          <button type="button" className={navButton} aria-label="Mes anterior" onClick={() => goToMonth(-1)}>
            <HugeiconsIcon icon={ChevronLeft} size={20} />
          </button>
          <button type="button" className={navButton} onClick={goToToday}>
            Hoy
          </button>
          <button type="button" className={navButton} aria-label="Mes siguiente" onClick={() => goToMonth(1)}>
            <HugeiconsIcon icon={ChevronRight} size={20} />

          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[14px] border-2 border-che-ink bg-che-paper">
        <div className="grid grid-cols-7 border-b-2 border-che-ink bg-che-bg-2">
          {WEEKDAY_HEADERS.map((name) => (
            <div key={name} className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wide text-che-ink-soft">
              {name}
            </div>
          ))}
        </div>

        {weeks.map((week, weekIndex) => (
          <div key={week[0]} className={`grid grid-cols-7 ${weekIndex > 0 ? 'border-t border-che-line' : ''}`}>
            {week.map((key, dayIndex) => {
              const inMonth = Number(key.slice(5, 7)) - 1 === cursor.month;
              const isToday = key === today;
              const isSelected = key === selected;
              const dayTasks = byDay.get(key) ?? [];

              return (
                <button
                  key={key}
                  type="button"
                  aria-label={`${longDayLabel(key)}${dayTasks.length ? `, ${dayTasks.length} tareas` : ''}`}
                  aria-pressed={isSelected}
                  className={`flex min-h-[96px] min-w-0 flex-col gap-1 p-1.5 text-left transition-colors ${dayIndex > 0 ? 'border-l border-che-line' : ''
                    } ${isSelected ? 'bg-che-mustard-soft' : inMonth ? 'hover:bg-che-bg' : 'bg-che-bg/60 hover:bg-che-bg'}`}
                  onClick={() => setSelected(key)}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isToday ? 'bg-che-coral text-che-ink' : inMonth ? 'text-che-ink' : 'text-che-ink-soft/50'
                      }`}
                  >
                    {Number(key.slice(8, 10))}
                  </span>

                  {dayTasks.slice(0, MAX_CHIPS).map((task) => {
                    const time = formatTime(task.dueDate, timeZone);
                    return (
                      <span
                        key={task.id}
                        title={task.title}
                        className={`block truncate rounded-[5px] border-l-[3px] px-1.5 py-0.5 text-[0.7rem] font-semibold leading-tight text-che-ink ${CHIP_STYLE[PRIORITY_TO_URGENCY[task.priority]]}`}
                      >
                        {time && <span className="mr-1 font-bold">{time}</span>}
                        {task.title}
                      </span>
                    );
                  })}
                  {dayTasks.length > MAX_CHIPS && (
                    <span className="px-1 text-[0.7rem] font-bold text-che-ink-soft">
                      +{dayTasks.length - MAX_CHIPS} más
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="my-7 mb-4 flex items-baseline gap-3.5">
        <h3 className="font-display text-lg font-semibold">{longDayLabel(selected)}</h3>
        <div className="h-[1.5px] flex-1 bg-[repeating-linear-gradient(90deg,#22301F_0,#22301F_4px,transparent_4px,transparent_9px)] opacity-35" />
      </div>
      {selectedTasks.length === 0 ? (
        <p className="text-che-ink-soft">Nada anotado para este día.</p>
      ) : (
        selectedTasks.map((task) => <div key={task.id}>{renderTask(task)}</div>)
      )}

      {undated.length > 0 && (
        <>
          <div className="my-7 mb-4 flex items-baseline gap-3.5">
            <h3 className="font-display text-lg font-semibold">Sin fecha</h3>
            <div className="h-[1.5px] flex-1 bg-[repeating-linear-gradient(90deg,#22301F_0,#22301F_4px,transparent_4px,transparent_9px)] opacity-35" />
          </div>
          {undated.map((task) => (
            <div key={task.id}>{renderTask(task)}</div>
          ))}
        </>
      )}
    </div>
  );
}
