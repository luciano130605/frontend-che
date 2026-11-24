import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  getMyTelegramLink,
  getCalendarConnectUrl,
  getCalendarStatus,
  disconnectCalendar,
  getProfile,
  updateNotificationChannel,
  updateProfile,
  changePassword,
  errorMessage,
  type NotificationChannel,
  type UserProfile,
} from "../lib/api";
import { updateSessionUser } from "../auth";
import NotificationPanel from "./NotificationPanel";
import AccountActions from "./AccountActions";

const CHANNEL_OPTIONS: { value: NotificationChannel; label: string }[] = [
  { value: "EMAIL", label: "Email" },
  { value: "TELEGRAM", label: "Telegram" },
  { value: "BOTH", label: "Ambos" },
];

const CALENDAR_RESULT_MESSAGES: Record<string, string> = {
  denied: "Cancelaste el permiso en Google. Podés intentarlo de nuevo cuando quieras.",
  error: "No pudimos conectar Google Calendar. Probá de nuevo.",
};

const TIME_ZONES = [
  { value: "America/Argentina/Buenos_Aires", city: "Buenos Aires" },
  { value: "America/Montevideo", city: "Montevideo" },
  { value: "America/Santiago", city: "Santiago de Chile" },
  { value: "America/Bogota", city: "Bogotá" },
  { value: "America/Mexico_City", city: "Ciudad de México" },
  { value: "Europe/Madrid", city: "Madrid" },
  { value: "UTC", city: "UTC" },
];

const PLAN_NAMES: Record<UserProfile["plan"], string> = {
  FREE: "Plan Gratis",
  PAID: "Plan pago",
};

interface ProfileForm {
  name: string;
  timeZone: string;
  dailySummaryTime: string;
}

function offsetLabel(timeZone: string) {
  try {
    const part = new Intl.DateTimeFormat("es-AR", { timeZone, timeZoneName: "shortOffset" })
      .formatToParts(new Date())
      .find((item) => item.type === "timeZoneName");
    return part ? ` (${part.value})` : "";
  } catch {
    return "";
  }
}

function formatResetDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-AR", { day: "numeric", month: "long" });
}

export default function ProfileView() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [form, setForm] = useState<ProfileForm>({ name: "", timeZone: "", dailySummaryTime: "08:00" });

  const [saving, setSaving] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [channelSaving, setChannelSaving] = useState(false);
  const [channelSaved, setChannelSaved] = useState(false);
  const [telegramLinking, setTelegramLinking] = useState(false);
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const [calendarConnected, setCalendarConnected] = useState<boolean | null>(null); // null = todavía cargando
  const [calendarBusy, setCalendarBusy] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(() => {
    // Volvemos de Google con ?calendar=connected|denied|error
    const result = new URLSearchParams(window.location.search).get("calendar");
    return result ? CALENDAR_RESULT_MESSAGES[result] ?? null : null;
  });

  useEffect(() => {
    // Ya leímos el resultado de Google en el estado inicial: limpiamos la URL.
    const params = new URLSearchParams(window.location.search);
    if (params.has("calendar")) {
      params.delete("calendar");
      const query = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    }

    let active = true;
    getCalendarStatus()
      .then(({ connected }) => {
        if (active) setCalendarConnected(connected);
      })
      .catch((err) => {
        if (active) {
          setCalendarConnected(false);
          setCalendarError(errorMessage(err, "No pudimos consultar el estado de Google Calendar."));
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleConnectCalendar() {
    setCalendarError(null);
    setCalendarBusy(true);
    try {
      const { url } = await getCalendarConnectUrl();
      window.location.href = url;
    } catch (err) {
      setCalendarError(errorMessage(err, "No pudimos iniciar la conexión con Google Calendar."));
      setCalendarBusy(false);
    }
  }

  async function handleDisconnectCalendar() {
    setCalendarError(null);
    setCalendarBusy(true);
    try {
      await disconnectCalendar();
      setCalendarConnected(false);
    } catch (err) {
      setCalendarError(errorMessage(err, "No pudimos desconectar Google Calendar."));
    } finally {
      setCalendarBusy(false);
    }
  }

  // Estados para Cambiar Contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (guardado) {
      const timer = setTimeout(() => setGuardado(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [guardado]);

  useEffect(() => {
    if (channelSaved) {
      const timer = setTimeout(() => setChannelSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [channelSaved]);

  useEffect(() => {
    if (passwordSaved) {
      const timer = setTimeout(() => setPasswordSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [passwordSaved]);

  useEffect(() => {
    let active = true;
    localStorage.removeItem("che_user_profile");
    setLoadError(null);

    getProfile()
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setForm({ name: data.name ?? "", timeZone: data.timeZone, dailySummaryTime: data.dailySummaryTime });
      })
      .catch((err) => {
        if (active) setLoadError(errorMessage(err, "No pudimos cargar tu perfil."));
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const updated = await updateProfile({
        name: form.name.trim(),
        timeZone: form.timeZone,
        dailySummaryTime: form.dailySummaryTime,
      });
      setProfile(updated);
      setForm({ name: updated.name ?? "", timeZone: updated.timeZone, dailySummaryTime: updated.dailySummaryTime });
      updateSessionUser({ name: updated.name });
      setGuardado(true);
    } catch (err) {
      setFormError(errorMessage(err, "No pudimos guardar tus preferencias."));
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChangeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Por favor completa todos los campos de contraseña.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas nuevas no coinciden.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(errorMessage(err, "No pudimos cambiar tu contraseña. Verificá tu clave actual."));
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleChannelChange(next: NotificationChannel) {
    if (!profile || next === profile.channel || channelSaving) return;

    const previous = profile.channel;
    setProfile((current) => (current ? { ...current, channel: next } : current));
    setNotifyError(null);
    setChannelSaving(true);
    try {
      await updateNotificationChannel(next);
      setChannelSaved(true);
    } catch (err) {
      setProfile((current) => (current ? { ...current, channel: previous } : current));
      setNotifyError(errorMessage(err, "No pudimos guardar tu preferencia."));
    } finally {
      setChannelSaving(false);
    }
  }

  async function handleLinkTelegram() {
    setNotifyError(null);
    setTelegramLinking(true);
    try {
      const { link } = await getMyTelegramLink();
      window.open(link, "_blank", "noopener,noreferrer");
      setTimeout(async () => {
        try {
          const fresh = await getProfile();
          setProfile((current) => (current ? { ...current, telegramLinked: fresh.telegramLinked } : fresh));
        } catch {
          // error silencioso
        }
      }, 4000);
    } catch (err) {
      setNotifyError(errorMessage(err, "No pudimos generar el link de Telegram."));
    } finally {
      setTelegramLinking(false);
    }
  }

  const zones = TIME_ZONES.some((zone) => zone.value === form.timeZone) || !form.timeZone
    ? TIME_ZONES
    : [...TIME_ZONES, { value: form.timeZone, city: form.timeZone }];

  return (
    <div className="space-y-6">
     

      <div className="flex items-center gap-4 border-b-2 border-che-ink pb-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-che-ink bg-che-coral shadow-che-sm shadow-che-ink">
          <div className="flex items-center gap-1">
            <div className="h-4 w-1 rounded-full bg-che-ink" />
            <div className="h-4 w-1 rounded-full bg-che-ink" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-che-ink sm:text-3xl">
            Tu perfil en <span className="font-medium italic text-che-coral">Che</span>
          </h1>
          <p className="text-xs text-che-ink-soft font-medium">
            Contale cómo dirigirse a vos para organizar tu semana sin vueltas.
          </p>
        </div>
      </div>

      {!profile ? (
        <div className="py-8 text-center">
          {loadError ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-che-coral-dark">{loadError}</p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="rounded-xl border-2 border-che-ink bg-che-paper px-4 py-2 text-xs font-bold text-che-ink shadow-che-sm shadow-che-ink transition-all hover:-translate-y-0.5"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <p className="text-sm font-semibold text-che-ink-soft">Cargando tu perfil…</p>
          )}
        </div>
      ) : (
        <>
          <section className="rounded-2xl border-2 border-che-ink bg-che-bg-2 p-4 sm:p-5 space-y-3 shadow-che-sm shadow-che-ink/10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-che-ink-soft">
                  Tu suscripción
                </span>
                <h2 className="font-display text-lg sm:text-xl font-bold text-che-ink leading-tight">
                  {PLAN_NAMES[profile.plan]}
                </h2>
              </div>
              <span className="inline-flex items-center rounded-full border border-che-ink bg-che-coral px-3 py-1 text-xs font-bold text-che-ink shadow-che-sm shadow-che-ink">
                Activo
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs font-bold">
                <span className="text-che-ink">Uso mensual de mensajes</span>
                <span className="text-che-ink-soft">
                  <strong className="text-che-ink">{profile.usage.used}</strong>
                  {profile.usage.limit !== null ? ` de ${profile.usage.limit} mensajes` : " mensajes · sin límite"}
                </span>
              </div>

              {profile.usage.limit !== null ? (
                <div className="h-3 w-full overflow-hidden rounded-full border border-che-ink bg-che-paper p-0.5">
                  <div
                    className="h-full rounded-full bg-che-coral transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(Math.round((profile.usage.used / profile.usage.limit) * 100), 100)}%` }}
                  />
                </div>
              ) : null}

              {profile.usage.blocked || profile.usage.nearLimit ? (
                <p className="rounded-lg border border-che-ink bg-che-coral-soft px-3 py-2 text-xs font-semibold text-che-ink">
                  {profile.usage.blocked
                    ? "Llegaste al límite de mensajes de este mes. Pasate a Che Pro para seguir sin límite."
                    : `Ya usaste ${profile.usage.used} de ${profile.usage.limit} mensajes. Con Che Pro tenés mensajes ilimitados.`}
                </p>
              ) : null}

              <p className="text-[11px] text-che-ink-soft font-medium">
                Tu cupo se renueva automáticamente el {formatResetDate(profile.usage.resetsOn)}.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-che-ink bg-che-paper p-3.5">
              <div className="text-center sm:text-left">
                <p className="font-display text-xs sm:text-sm font-bold text-che-ink">
                  ¿Necesitás más mensajes sin límites?
                </p>
                <p className="text-xs text-che-ink-soft">
                  ¡Hacé una mejora de plan y disfrutá de más beneficios!
                </p>
              </div>
              <Link
                to="/#precios"
                className="whitespace-nowrap rounded-xl border border-che-ink bg-che-ink px-4 py-1.5 text-xs font-bold text-che-bg transition-all hover:-translate-y-0.5 hover:bg-che-coral-dark hover:shadow-che-sm hover:shadow-che-ink"
              >
                Ver planes
              </Link>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div>
              <label htmlFor="name" className="block font-display text-sm sm:text-base font-bold text-che-ink">
                ¿Cómo querés que te llame <span className="italic text-che-coral-dark">Che</span>?
              </label>
              <p className="mb-1.5 text-xs text-che-ink-soft">
                Es el nombre o apodo que usará cuando te responda o te avise qué tenés pendiente.
              </p>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={60}
                placeholder="Ej: Ema, Fran, Nico..."
                className="w-full rounded-xl border-2 border-che-ink bg-che-bg px-4 py-2.5 text-sm font-medium text-che-ink focus:border-che-coral focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-display text-sm sm:text-base font-bold text-che-ink">
                Mail de tu cuenta
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="mt-1 w-full cursor-not-allowed rounded-xl border-2 border-che-line bg-che-bg/60 px-4 py-2.5 text-sm font-medium text-che-ink-soft"
              />
              <span className="mt-1 block text-[11px] text-che-ink-soft font-medium">
                Vigente para el inicio de sesión.
              </span>
            </div>

            <div className="space-y-3 rounded-2xl border-2 border-che-ink bg-che-paper p-4 shadow-che-sm shadow-che-ink/10">
              <span className="block font-display text-sm sm:text-base font-bold text-che-ink">
                Cambiar contraseña
              </span>

              <div>
                <label className="block text-xs font-bold text-che-ink-soft mb-1">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border-2 border-che-line bg-che-bg px-3.5 py-2 text-sm text-che-ink focus:border-che-ink focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-che-ink-soft mb-1">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border-2 border-che-line bg-che-bg px-3.5 py-2 text-sm text-che-ink focus:border-che-ink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-che-ink-soft mb-1">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border-2 border-che-line bg-che-bg px-3.5 py-2 text-sm text-che-ink focus:border-che-ink focus:outline-none"
                  />
                </div>
              </div>

              {passwordError && (
                <p className="text-xs font-bold text-che-coral-dark">{passwordError}</p>
              )}

              {passwordSaved && (
                <p className="text-xs font-bold text-emerald-700">
                  ✓ Contraseña actualizada correctamente
                </p>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handlePasswordChangeSubmit}
                  disabled={passwordSaving}
                  className="rounded-xl border border-che-ink bg-che-ink px-4 py-2 text-xs font-bold text-che-bg transition-all hover:-translate-y-0.5 hover:bg-che-coral-dark hover:shadow-che-sm hover:shadow-che-ink disabled:opacity-50"
                >
                  {passwordSaving ? "Actualizando…" : "Actualizar contraseña"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 flex flex-col">
                <label htmlFor="timeZone" className="block font-display text-sm sm:text-base font-bold text-che-ink">
                  Zona horaria
                </label>
                <p className="mb-1 text-xs text-che-ink-soft">
                  Con esta zona interpreto tus fechas y calculo a qué hora avisarte.
                </p>
                <div className="relative mt-auto">
                  <select
                    id="timeZone"
                    name="timeZone"
                    value={form.timeZone}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl border-2 border-che-ink bg-che-bg px-3.5 py-2.5 text-sm font-medium text-che-ink focus:border-che-coral focus:outline-none transition-all pr-10"
                  >
                    {zones.map((zone) => (
                      <option key={zone.value} value={zone.value}>
                        {zone.city}
                        {offsetLabel(zone.value)}
                      </option>
                    ))}
                  </select>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-che-ink"
                  >
                    <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="dailySummaryTime" className="block font-display text-sm sm:text-base font-bold text-che-ink">
                  Resumen diario
                </label>
                <p className="mb-1 text-xs text-che-ink-soft">
                  A qué hora te lo mando.
                </p>
                <input
                  id="dailySummaryTime"
                  type="time"
                  name="dailySummaryTime"
                  value={form.dailySummaryTime}
                  onChange={handleChange}
                  className="mt-auto w-full rounded-xl border-2 border-che-ink bg-che-bg px-3.5 py-2 text-sm font-bold text-che-ink focus:border-che-coral focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border-2 border-che-ink bg-che-paper p-4 shadow-che-sm shadow-che-ink/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-display text-sm sm:text-base font-bold text-che-ink">
                    ¿Por dónde te aviso?
                  </span>
                  <p className="text-xs text-che-ink-soft">
                    Elegí dónde querés recibir tu resumen diario y los avisos.
                  </p>
                </div>
                {channelSaved ? (
                  <span className="shrink-0 text-xs font-bold text-che-coral-dark">✓ Guardado</span>
                ) : null}
              </div>

              <div role="radiogroup" aria-label="Canal de avisos" className="grid grid-cols-3 gap-2">
                {CHANNEL_OPTIONS.map((option) => {
                  const needsTelegram = option.value !== "EMAIL";
                  const active = profile.channel === option.value;
                  const disabled = channelSaving || (needsTelegram && !profile.telegramLinked);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={disabled}
                      onClick={() => handleChannelChange(option.value)}
                      className={`rounded-xl border-2 px-3 py-2 text-xs font-bold transition-all sm:text-sm ${
                        active
                          ? "border-che-ink bg-che-ink text-che-bg shadow-che-sm shadow-che-ink"
                          : "border-che-line bg-che-paper text-che-ink hover:border-che-ink hover:bg-che-bg"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {!profile.telegramLinked ? (
                <p className="text-xs font-medium text-che-ink-soft">
                  Para recibir avisos por Telegram, primero vinculá tu cuenta.
                </p>
              ) : null}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-che-line pt-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-che-ink bg-[#2AABEE] text-white shadow-che-sm shadow-che-ink">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold text-che-ink">
                        Canal de Telegram
                      </span>
                      {profile.telegramLinked ? (
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-600 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Vinculado
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-che-ink-soft">
                      {profile.telegramLinked
                        ? 'También podés escribirle al bot "che, qué tenemos para hoy".'
                        : "Vinculá tu cuenta para chatear con Che y recibir avisos ahí."}
                    </p>
                  </div>
                </div>

                {!profile.telegramLinked ? (
                  <button
                    type="button"
                    onClick={handleLinkTelegram}
                    disabled={telegramLinking}
                    className="whitespace-nowrap rounded-xl border border-che-ink bg-[#2AABEE] px-4 py-2 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-che-sm hover:shadow-che-ink disabled:opacity-60"
                  >
                    {telegramLinking ? "Abriendo…" : "Vincular Telegram"}
                  </button>
                ) : null}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-che-line pt-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-che-ink bg-[#4285F4] text-white shadow-che-sm shadow-che-ink">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold text-che-ink">
                        Google Calendar
                      </span>
                      {calendarConnected === true ? (
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-600 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Conectado
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-che-ink-soft">
                      {calendarConnected === true
                        ? "Tus tareas con fecha aparecen en tu calendario y se actualizan solas."
                        : "Conectalo para ver tus tareas con fecha en tu Google Calendar."}
                    </p>
                  </div>
                </div>

                {calendarConnected === true ? (
                  <button
                    type="button"
                    onClick={handleDisconnectCalendar}
                    disabled={calendarBusy}
                    className="whitespace-nowrap rounded-xl border border-che-ink bg-che-paper px-4 py-2 text-xs font-bold text-che-ink transition-all hover:-translate-y-0.5 hover:shadow-che-sm hover:shadow-che-ink disabled:opacity-60"
                  >
                    {calendarBusy ? "Desconectando…" : "Desconectar"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectCalendar}
                    disabled={calendarBusy || calendarConnected === null}
                    className="whitespace-nowrap rounded-xl border border-che-ink bg-[#4285F4] px-4 py-2 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-che-sm hover:shadow-che-ink disabled:opacity-60"
                  >
                    {calendarBusy ? "Abriendo…" : "Conectar Calendar"}
                  </button>
                )}
              </div>

              {calendarError ? (
                <p className="text-xs font-bold text-che-coral-dark">{calendarError}</p>
              ) : null}

              {notifyError ? (
                <p className="text-xs font-bold text-che-coral-dark">{notifyError}</p>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-che-line">
              <button
                type="submit"
                disabled={saving}
                className="group relative inline-flex min-h-11 items-center justify-center overflow-hidden rounded-xl border-2 border-che-ink bg-che-ink px-6 text-sm font-bold text-che-bg transition-all hover:-translate-y-0.5 hover:bg-che-coral-dark hover:shadow-che-sm hover:shadow-che-ink active:scale-[0.96] disabled:opacity-60"
              >
                <span className="relative z-10">{saving ? "Guardando…" : "Guardar preferencias"}</span>
              </button>
              {guardado ? (
                <span className="text-xs font-bold text-che-coral-dark">✓ Cambios guardados</span>
              ) : null}
              {formError ? (
                <span className="text-xs font-bold text-che-coral-dark">{formError}</span>
              ) : null}
            </div>
          </form>
        </>
      )}

      {/* No molestar: franja horaria sin recordatorios. */}
      <NotificationPanel />

      {/* Cerrar sesión y eliminar cuenta. */}
      <AccountActions />
    </div>
  );
}