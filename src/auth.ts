import { useMemo, useSyncExternalStore } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  // Ausente en sesiones guardadas antes de la verificación de email: se trata como verificado.
  emailVerified?: boolean;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
const SESSION_KEY = 'che.auth';
const SESSION_EVENT = 'che.session';

// La sesión vive en localStorage para que la app instalada (PWA) no pida login cada vez que se abre.
// Dura lo que dure el JWT (JWT_EXPIRES_IN en el back); vencido, se descarta.

/** `exp` del JWT en ms, o null si no se puede leer (en ese caso decide el backend con un 401). */
function tokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

function parseSession(raw: string | null): AuthSession | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || !('token' in parsed) ||
        typeof parsed.token !== 'string' || !('user' in parsed)) return null;
    const expiry = tokenExpiry(parsed.token);
    if (expiry !== null && expiry <= Date.now()) return null;
    return parsed as AuthSession;
  } catch {
    return null;
  }
}

// Migración: quien ya estaba logueado con la versión que usaba sessionStorage no pierde la sesión.
try {
  const legacy = sessionStorage.getItem(SESSION_KEY);
  if (legacy) {
    if (!localStorage.getItem(SESSION_KEY)) localStorage.setItem(SESSION_KEY, legacy);
    sessionStorage.removeItem(SESSION_KEY);
  }
} catch {
  // almacenamiento bloqueado: no hay nada que migrar
}

function readRawSession(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function notifySessionChange() {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function getSession(): AuthSession | null {
  const raw = readRawSession();
  const session = parseSession(raw);
  if (raw && !session) clearSession(); // vencida o corrupta
  return session;
}

export function saveSession(session: AuthSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // almacenamiento bloqueado (modo privado estricto): no se puede recordar la sesión
  }
  notifySessionChange();
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // nada que limpiar si el almacenamiento está bloqueado
  }
  notifySessionChange();
}

export function updateSessionUser(changes: Partial<AuthUser>) {
  const session = getSession();
  if (session) saveSession({ ...session, user: { ...session.user, ...changes } });
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === SESSION_KEY) onChange(); };
  window.addEventListener(SESSION_EVENT, onChange);
  window.addEventListener('storage', onStorage); // login/logout en otra pestaña
  return () => {
    window.removeEventListener(SESSION_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

// La sesión como estado de React: los componentes se actualizan solos cuando cambia (login, logout, cambio de nombre).
export function useSession(): AuthSession | null {
  const raw = useSyncExternalStore(subscribe, readRawSession, () => null);
  return useMemo(() => parseSession(raw), [raw]);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = getSession();
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intentá de nuevo.');
  }
  const result = await response.json().catch(() => null);
  if (response.status === 401) clearSession();
  if (!response.ok) throw new Error(result?.error ?? 'No se pudo completar la operación.');
  return result as T;
}

export async function authenticate(
  endpoint: 'login' | 'register' | 'google',
  body: Record<string, string>,
): Promise<AuthSession> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intentá de nuevo.');
  }

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.error ?? 'No se pudo completar el acceso.');
  }
  if (!result?.token || !result?.user) {
    throw new Error('El servidor devolvió una respuesta inesperada.');
  }
  return result as AuthSession;
}

export async function validateSession(session: AuthSession): Promise<AuthSession> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
  } catch {
    throw new Error('No se pudo validar la sesión con el servidor.');
  }

  const result = await response.json().catch(() => null);
  if (response.status === 401) {
    clearSession();
    throw new Error('Tu sesión venció. Ingresá nuevamente.');
  }
  if (!response.ok || !result?.user) {
    throw new Error(result?.error ?? 'No se pudo validar la sesión.');
  }

  const refreshed = { token: session.token, user: result.user } as AuthSession;
  saveSession(refreshed);
  return refreshed;
}
