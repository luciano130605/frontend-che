import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSession } from "../auth";
import { fetchTasks, getProfile, type Task, type UserProfile } from "../lib/api";
import Header from "./landing/Header";
import Precios from "./landing/Precios";
import Mensaje from "./landing/Mensaje";
import { CheAvatar } from "./avatar/avatar";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail02Icon, Note05Icon, Notification } from "@hugeicons/core-free-icons";
import { useAvatarMood } from "./avatar/avatar-mood-context";
import { isExpired } from "../lib/dates";
import { compareByDueDate } from "../lib/taskUi";

function channelLabel(channel: UserProfile["channel"]) {
  if (channel === "BOTH") return "Email y Telegram";
  return channel === "TELEGRAM" ? "Telegram" : "Email";
}



function dueLabel(dueDate: string | null) {
  if (!dueDate) return "Sin fecha";
  const [year, month, day] = dueDate.slice(0, 10).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return "Fecha pendiente";
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" }).format(date);
}

export default function MemberHome() {
  const session = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [failed, setFailed] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [tasksError, setTasksError] = useState(false);
  const [tasksRetry, setTasksRetry] = useState(0);
  const retryTasks = useCallback(() => setTasksRetry(value => value + 1), []);
  useEffect(() => {
    let active = true;
    getProfile().then(data => { if (active) setProfile(data); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [session?.token]);

  useEffect(() => {
    let active = true;
    setTasksLoaded(false);
    setTasksError(false);
    fetchTasks({ upcoming: true })
      .then(data => {
        if (active) setTasks(data.filter(task => task.status === "PENDING" && !isExpired(task)).sort(compareByDueDate));
      })
      .catch(() => { if (active) setTasksError(true); })
      .finally(() => { if (active) setTasksLoaded(true); });
    window.addEventListener("focus", retryTasks);
    return () => {
      active = false;
      window.removeEventListener("focus", retryTasks);
    };
  }, [session?.token, tasksRetry, retryTasks]);

  const firstName = session?.user.name?.split(" ")[0];
  const isPaid = profile?.plan === "PAID";
  const {
    followCursor,
  } = useAvatarMood();


  return (
    <div className="member-home relative min-h-screen overflow-hidden">
      <Header />
      <main id="top" className="pb-28 sm:pb-16">
        <section className="relative mx-auto max-w-[1180px] px-4 pt-5 sm:px-7 sm:pt-12">
          <div aria-hidden className="absolute right-0 top-0 -z-10 h-72 w-72 rounded-full bg-che-coral/15 blur-3xl" />
          <div className="grid items-center gap-5 rounded-[1.75rem] border border-che-line bg-che-paper/85 p-5 shadow-[0_18px_50px_-34px_rgba(32,35,34,.55)] backdrop-blur sm:gap-8 sm:rounded-[2rem] sm:p-9 md:grid-cols-[1fr_auto]">
            <div>

              <h1 className="font-display text-[2.15rem] leading-none tracking-tight text-che-ink sm:mt-4 sm:text-5xl">Hola{firstName ? `, ${firstName}` : ""}<span className="text-che-coral-dark">.</span></h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-che-ink-soft sm:text-base">Acá tenés a mano tu organización, tus avisos y lo importante de la semana.</p>
              <div className="mt-5 grid gap-2 sm:mt-6 sm:flex sm:flex-wrap sm:gap-3">
                <Link to="/app"
                  className="   group relative inline-flex items-center gap-1.5
                                        overflow-hidden rounded-xl border border-che-ink bg-che-ink
                                        font-semibold text-che-bg
                                        transition-all duration-300 ease-out
                                        hover:-translate-y-0.5 hover:bg-che-coral-dark
                                        hover:border-che-coral-dark
                                        hover:shadow-che-sm hover:shadow-che-ink
                                        active:scale-[.98] active:shadow-none p-3 min-h-12 justify-center sm:min-h-0">


                  <span className="relative z-10">Ver mis tareas</span>
                  <span
                    aria-hidden
                    className="
                                            absolute inset-0 -translate-x-full bg-che-coral
                                            transition-transform duration-300 ease-out
                                            group-hover:translate-x-0
                                        "
                  />
                </Link>
                <Link to="/profile"
                  className="    inline-flex items-center rounded-xl
                                        border border-che-line bg-che-paper
                                        font-semibold text-che-ink
                                        transition-all duration-300 ease-out
                                        hover:-translate-y-0.5 hover:border-che-ink
                                        hover:shadow-che-sm hover:shadow-che-ink
                                        active:scale-[.98] active:shadow-none p-3 min-h-12 justify-center sm:min-h-0">
                  Ajustar preferencias
                </Link>
              </div>
            </div>
            <div className="order-first mx-auto flex size-24 items-center justify-center rounded-full border border-che-line bg-che-bg-2 sm:order-none sm:size-40"><CheAvatar mood="working" size={136} className="scale-[.7] sm:scale-[.88]" followCursor={followCursor} /></div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 pt-8 sm:px-7 sm:pt-10">
          <div className="rounded-[1.75rem] border border-che-line bg-che-bg-2/65 p-4 sm:rounded-[2rem] sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[.16em] text-che-coral-dark">Para seguir hoy</p><h2 className="mt-1 font-display text-2xl tracking-tight sm:text-3xl">Tus tareas por hacer</h2></div>
              <Link to="/app" className="hidden sm:inline-flex items-center rounded-xl
                                        border border-che-line bg-che-paper
                                        font-semibold text-che-ink
                                        transition-all duration-300 ease-out
                                        hover:-translate-y-0.5 hover:border-che-ink
                                        hover:shadow-che-sm hover:shadow-che-ink
                                        active:translate-y-0 active:shadow-none p-3">Ver todas </Link>
            </div>
            {!tasksLoaded ? <p className="mt-6 text-sm text-che-ink-soft">Cargando tus tareas…</p> : tasksError ? (
              <div role="alert" className="mt-6 rounded-2xl border border-che-line bg-che-paper p-4 text-sm text-che-ink-soft">
                <p>No pudimos cargar tus tareas. Volvé a intentarlo.</p>
                <button type="button" onClick={retryTasks} className="mt-2 font-semibold text-che-coral-dark underline">Reintentar</button>
              </div>
            ) : tasks.length ? (
              <div className="-mx-1 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:mt-6 md:grid md:overflow-visible md:px-0 md:pb-0 md:grid-cols-3">
                {tasks.slice(0, 3).map((task) => (
                  <Link key={task.id} to="/app" className="group w-[86%] shrink-0 snap-start rounded-2xl border border-che-line bg-che-paper p-4 transition active:scale-[.98] md:w-auto hover:-translate-y-0.5 hover:border-che-ink hover:shadow-che-sm hover:shadow-che-ink">
                    <div className="flex items-start gap-3"><span className="mt-0.5 size-4 shrink-0 rounded-full border-2 border-che-coral" /><div className="min-w-0"><h3 className="truncate font-semibold text-che-ink">{task.title}</h3><p className="mt-1 text-xs text-che-ink-soft">{task.category?.name ?? "Sin categoría"} · {dueLabel(task.dueDate)}</p></div></div>
                  </Link>
                ))}
              </div>
            ) : <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-che-line bg-che-paper/70 p-4 text-sm text-che-ink-soft">No tenés tareas pendientes. ¡Viene muy bien esa semana!</div>}
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 pt-8 sm:px-7 sm:pt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-che-coral-dark">Tus notificaciones</p><h2 className="mt-1 font-display text-2xl tracking-tight sm:text-3xl">Todo listo para avisarte a tiempo.</h2></div>
            <Link to="/profile" className="hidden text-sm font-bold text-che-ink-soft hover:text-che-ink sm:block">Editar</Link>
          </div>
          {profile ? (
            <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr]">
              <article className="rounded-3xl border border-che-line bg-che-ink p-5 text-che-bg sm:p-6"><div className="flex items-start justify-between gap-3"><div className="flex size-11 items-center justify-center rounded-2xl bg-che-coral text-che-ink"><HugeiconsIcon icon={Notification} className="size-5" /></div><span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-bold text-emerald-200"> Activo</span></div><h3 className="mt-7 font-display text-xl">Resumen diario</h3><p className="mt-2 text-sm leading-relaxed text-che-bg/75">Te mandamos lo que tenés pendiente cada día a las <strong className="text-che-bg">{profile.dailySummaryTime}</strong>.</p></article>
              <article className="rounded-3xl border border-che-line bg-che-paper p-5 sm:p-6"><div className="flex size-11 items-center justify-center rounded-2xl bg-che-lav-soft text-che-ink"><HugeiconsIcon icon={Mail02Icon} className="size-5" /></div><p className="mt-6 text-xs font-bold uppercase tracking-[.14em] text-che-ink-soft">Canal elegido</p><h3 className="mt-1 font-display text-xl">{channelLabel(profile.channel)}</h3><p className="mt-2 text-sm leading-relaxed text-che-ink-soft">{profile.channel === "EMAIL" ? "Tus avisos llegan a tu correo." : profile.telegramLinked ? "Tu cuenta de Telegram está vinculada." : "Telegram se enviará por email hasta que lo vincules."}</p></article>
              <article className="rounded-3xl border border-che-line bg-che-paper p-5 sm:p-6"><div className="flex size-11 items-center justify-center rounded-2xl bg-che-mustard-soft text-che-ink"><HugeiconsIcon icon={Note05Icon} className="size-5" /></div><p className="mt-6 text-xs font-bold uppercase tracking-[.14em] text-che-ink-soft">Plan actual</p><h3 className="mt-1 font-display text-xl">{isPaid ? "Plan pago" : "Plan gratuito"}</h3><p className="mt-2 text-sm leading-relaxed text-che-ink-soft">{isPaid ? "Incluye recordatorios puntuales antes de cada vencimiento." : "Incluye tu resumen diario; los recordatorios puntuales están disponibles en el plan pago."}</p></article>
            </div>
          ) : <div className="rounded-3xl border border-che-line bg-che-paper p-6 text-sm text-che-ink-soft">{failed ? "No pudimos cargar tus preferencias de avisos. Podés volver a intentarlo desde tu perfil." : "Cargando el estado de tus notificaciones…"}</div>}
        </section>

        <section className="pt-6 sm:pt-10">
          <Mensaje />
        </section>

        <section className="mx-auto max-w-[1180px] px-4 pt-14 sm:px-7 sm:pt-18"><Precios profile={profile} profileFailed={failed} /></section>
      </main>
    </div>
  );
}
