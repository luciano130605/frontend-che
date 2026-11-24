import type { Task } from './api';

export const DEFAULT_TIME_ZONE = 'America/Argentina/Buenos_Aires';

const DAY_MS = 24 * 60 * 60 * 1000;
const NO_DUE_DATE_VISIBLE_MS = 7 * DAY_MS;

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    };
    try {
      formatter = new Intl.DateTimeFormat('en-CA', { ...options, timeZone });
    } catch {
      // zona inválida: mejor mostrar la hora del navegador que romper la pantalla
      formatter = new Intl.DateTimeFormat('en-CA', options);
    }
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

const pad = (value: number) => String(value).padStart(2, '0');

interface Parts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

function zonedParts(date: Date, timeZone: string): Parts {
  const values: Record<string, number> = {};
  for (const part of formatterFor(timeZone).formatToParts(date)) {
    if (part.type !== 'literal') values[part.type] = Number(part.value);
  }
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour % 24,
    minute: values.minute,
  };
}

/** "2026-10-19" en la zona horaria del usuario. */
export function dateKey(date: Date, timeZone: string): string {
  const { year, month, day } = zonedParts(date, timeZone);
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function todayKey(timeZone: string, now = new Date()): string {
  return dateKey(now, timeZone);
}

function keyToUtc(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDaysToKey(key: string, days: number): string {
  const date = keyToUtc(key);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Días de calendario entre dos claves (a - b). */
export function dayDiff(a: string, b: string): number {
  return Math.round((keyToUtc(a).getTime() - keyToUtc(b).getTime()) / DAY_MS);
}

export function weekdayOfKey(key: string): number {
  return keyToUtc(key).getUTCDay();
}

/** "15:30", o undefined si no tiene hora (tarea de todo el día). */
export function formatTime(dueDate: string | null, timeZone: string): string | undefined {
  if (!dueDate) return undefined;
  const { hour, minute } = zonedParts(new Date(dueDate), timeZone);
  if (hour === 0 && minute === 0) return undefined;
  return `${pad(hour)}:${pad(minute)}`;
}

export function formatDayLabel(key: string | null, today: string): string {
  if (!key) return 'Sin fecha';
  const diff = dayDiff(key, today);
  const weekday = DAY_NAMES[weekdayOfKey(key)];

  if (diff === 0) return `Hoy — ${weekday}`;
  if (diff === 1) return `Mañana — ${weekday}`;
  if (diff === -1) return `Ayer — ${weekday}`;
  if (diff >= 2 && diff <= 6) return weekday;
  return longDayLabel(key);
}

/** "Lunes 19 de octubre" */
export function longDayLabel(key: string): string {
  const date = keyToUtc(key);
  return `${DAY_NAMES[date.getUTCDay()]} ${date.getUTCDate()} de ${MONTH_NAMES[date.getUTCMonth()]}`;
}

/** "19 oct" */
export function formatShortDate(iso: string, timeZone: string): string {
  const key = dateKey(new Date(iso), timeZone);
  const date = keyToUtc(key);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()].slice(0, 3)}`;
}

export function monthTitle(year: number, month: number): string {
  return `${MONTH_NAMES[month]} de ${year}`;
}

/** Valores para los <input type="date"> y <input type="time"> del editor. */
export function dueDateToInputs(dueDate: string | null, timeZone: string) {
  if (!dueDate) return { date: '', time: '' };
  const date = new Date(dueDate);
  return { date: dateKey(date, timeZone), time: formatTime(dueDate, timeZone) ?? '' };
}

/** Lo que espera el backend: "AAAA-MM-DD", "AAAA-MM-DDTHH:mm" o null para quitar la fecha. */
export function inputsToDueDate(date: string, time: string): string | null {
  if (!date) return null;
  return time ? `${date}T${time}` : date;
}

/**
 * Misma regla que el filtro `upcoming` del backend: una tarea pendiente deja de mostrarse
 * 24 h después de su fecha (o a los 7 días si nunca tuvo fecha) y pasa al historial.
 */
export function isExpired(task: Pick<Task, 'status' | 'dueDate' | 'createdAt'>, now = Date.now()): boolean {
  if (task.status !== 'PENDING') return false;
  if (task.dueDate) return now >= new Date(task.dueDate).getTime() + DAY_MS;
  if (task.createdAt) return now >= new Date(task.createdAt).getTime() + NO_DUE_DATE_VISIBLE_MS;
  return false;
}
