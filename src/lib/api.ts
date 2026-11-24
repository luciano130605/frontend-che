import { getSession } from '../auth';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api").replace(
  /\/+$/,
  "",
);

function describeNetworkError(error: unknown): string {
  const hint = `No pudimos conectar con el backend en ${API_BASE_URL}.`;
  const detail =
    error instanceof Error && error.message ? error.message : "error de red";

  if (typeof window !== "undefined" && window.location.protocol === "https:" && API_BASE_URL.startsWith("http://")) {
    return `${hint} Safari bloquea el pedido porque la página es HTTPS y la API es HTTP (contenido mixto). Serví el backend por HTTPS o abrí el front por http://localhost.`;
  }

  return `${hint} Verificá que el servidor esté corriendo y que la URL sea la correcta. (${detail})`;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  {
    method = "GET",
    body,
    auth = true,
  }: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const session = getSession();
    if (session) headers.Authorization = `Bearer ${session.token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiError(describeNetworkError(error), 0);
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (payload as { error?: string } | null)?.error ??
      `La API respondió ${response.status} ${response.statusText || ""}`.trim();
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export function errorMessage(error: unknown, fallback = "No pudimos completar la operación."): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export interface TaskCategoryRef {
  id: string;
  name: string;
  color: string | null;
}

export interface Task {
  id: string;
  title: string;
  rawText: string;
  dueDate: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "DONE" | "DISMISSED";
  category: TaskCategoryRef | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string | null;
}

// dueDate viaja como "AAAA-MM-DD" (todo el día) o "AAAA-MM-DDTHH:mm" (hora local del perfil);
// el backend lo interpreta en la zona horaria del usuario. null quita la fecha.
export interface TaskChanges {
  title?: string;
  categoryId?: string | null;
  dueDate?: string | null;
  priority?: Task["priority"];
}

export async function parseTasks(rawText: string): Promise<Task[]> {
  // El back interpreta y devuelve un borrador (/ai/parse); se confirma en el mismo paso para guardar directo.
  // Si la IA no lo entiende, el texto queda en "Sin interpretar" y se avisa con el error.
  const result = await interpretText(rawText);
  if (result.status === "FAILED") throw new ApiError(result.message, 422);
  const { tasks } = await confirmInterpretation(result.interpretationId, result.tasks);
  return tasks;
}

export function fetchTasks(params?: { upcoming?: boolean }) {
  const query = params?.upcoming ? "?upcoming=true" : "";
  return request<Task[]>(`/tasks${query}`);
}

// Lo que ya salió de la lista principal: tareas hechas y vencidas.
export function fetchHistory() {
  return request<Task[]>("/tasks?history=true");
}

export function fetchCategories() {
  return request<Category[]>("/categories");
}

export function updateTaskStatus(taskId: string, status: "PENDING" | "DONE") {
  return request<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: { status },
  });
}

export function updateTask(taskId: string, changes: TaskChanges) {
  return request<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: changes,
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  await request<null>(`/tasks/${taskId}`, { method: "DELETE" });
}

export interface TelegramLink {
  link: string;
  botUsername: string;
}

export function getMyTelegramLink() {
  return request<TelegramLink>("/telegram/link");
}

export type NotificationChannel = "EMAIL" | "TELEGRAM" | "BOTH";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  timeZone: string;
  dailySummaryTime: string;
  channel: NotificationChannel;
  telegramLinked: boolean;
  plan: "FREE" | "PAID";
  usage: {
    used: number;
    limit: number | null;
    nearLimit: boolean;
    blocked: boolean;
    resetsOn: string;
  };
}

export function getProfile() {
  return request<UserProfile>("/profile");
}

export function updateProfile(changes: Partial<Pick<UserProfile, "name" | "timeZone" | "dailySummaryTime">>) {
  return request<UserProfile>("/profile", {
    method: "PATCH",
    body: changes,
  });
}

export function updateNotificationChannel(channel: NotificationChannel) {
  return request<{ channel: NotificationChannel; telegramLinked: boolean }>("/notifications/preferences", {
    method: "PATCH",
    body: { channel },
  });
}

export function changePassword(body: { currentPassword: string; newPassword: string }) {
  return request<{ message: string }>("/auth/change-password", {
    method: "PATCH",
    body,
  });
}




// --- Interfaces para Grupos ---
export interface Group {
  id: string;
  name: string;
  code: string;
  role: "ADMIN" | "MEMBER";
  membersCount: number;
}

// --- Servicios de API para Grupos ---
export function getMyGroups() {
  return request<Group[]>("/groups", {
    method: "GET",
  });
}

export function createGroup(name: string) {
  return request<Group>("/groups", {
    method: "POST",
    body: { name },
  });
}

export function joinGroup(code: string) {
  return request<Group>("/groups/join", {
    method: "POST",
    body: { code },
  });
}

/** Google Calendar: la conexión es un redirect OAuth que vuelve a /profile?calendar=... */
export function getCalendarConnectUrl() {
  return request<{ url: string }>("/calendar/connect");
}

export function getCalendarStatus() {
  return request<{ connected: boolean }>("/calendar/status");
}

export function disconnectCalendar() {
  return request<null>("/calendar", { method: "DELETE" });
}

/** Interpretación con IA: preview para confirmar o corregir, y textos que quedaron "Sin interpretar". */
export interface ParsedTask {
  title: string;
  categoryName: string | null;
  dueDate: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export type InterpretationResult =
  | { interpretationId: string; status: "PENDING"; tasks: ParsedTask[] }
  | { interpretationId: string; status: "FAILED"; message: string };

export interface UnparsedItem {
  id: string;
  originalText: string;
  error: string | null;
  createdAt: string;
}

export function interpretText(rawText: string) {
  return request<InterpretationResult>("/ai/parse", { method: "POST", body: { rawText } });
}

export function confirmInterpretation(interpretationId: string, tasks: ParsedTask[]) {
  return request<{ tasks: Task[] }>("/ai/confirm", { method: "POST", body: { interpretationId, tasks } });
}

export function fetchUnparsed() {
  return request<{ items: UnparsedItem[] }>("/ai/unparsed");
}

export function retryUnparsed(id: string) {
  return request<InterpretationResult>(`/ai/unparsed/${id}/retry`, { method: "POST" });
}

export function saveUnparsedAsTask(id: string) {
  return request<{ task: Task }>(`/ai/unparsed/${id}/save`, { method: "POST" });
}

export function deleteUnparsed(id: string) {
  return request<null>(`/ai/unparsed/${id}`, { method: "DELETE" });
}

// ---- Pagos (Mercado Pago) ----

export function createCheckout(period: "mensual" | "anual") {
  return request<{ url: string }>("/payments/checkout", { method: "POST", body: { period } });
}

// Se llama al volver de Mercado Pago con el preapproval_id que trae la URL.
export function confirmPayment(preapprovalId: string) {
  return request<{ status: "pending" | "authorized" | "paused" | "cancelled"; plan: "FREE" | "PAID" }>(
    "/payments/confirm",
    { method: "POST", body: { preapprovalId } },
  );
}

export function cancelSubscription() {
  return request<null>("/payments/cancel", { method: "POST" });
}
