import type { Urgency } from '../types';
import type { Task } from './api';

export const PRIORITY_TO_URGENCY: Record<Task['priority'], Urgency> = {
  HIGH: 'alta',
  MEDIUM: 'media',
  LOW: 'baja',
};

/** Fecha ascendente, las tareas sin fecha al final. */
export function compareByDueDate(a: Task, b: Task): number {
  if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;
  return 0;
}
