export type View = 'landing' | 'app' | 'auth'|'profile';

export type AuthTab = 'login' | 'register';
export type Urgency = 'alta' | 'media' | 'baja';

export interface TaskCategory {
  label: string;
  key: string;
}

export interface Task {
  id?: string;
  title: string;
  urgency?: Urgency;
  category?: TaskCategory;
  time?: string;
  extra?: string;
  initialDone?: boolean;
}

export interface TaskDayGroup {
  day: string;
  tag?: string;
  tasks: Task[];
}
