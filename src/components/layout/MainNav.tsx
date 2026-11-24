import { Link } from "@tanstack/react-router";

const FOCUS_RING =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-che-coral focus-visible:ring-offset-2 focus-visible:ring-offset-che-bg";

const ITEM =
    `rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors duration-200 ease-out sm:px-4 sm:text-sm ${FOCUS_RING}`;

const ACTIVE = { className: "bg-che-ink text-che-bg" };
const INACTIVE = { className: "text-che-ink-soft hover:text-che-ink" };

export default function MainNav() {
    return (
        <>
        <nav aria-label="Principal" className="hidden items-center gap-0.5 sm:flex sm:gap-1">
            <Link
                to="/"
                activeOptions={{ exact: true }}
                activeProps={ACTIVE}
                inactiveProps={INACTIVE}
                className={ITEM}
            >
                Inicio
            </Link>
            <Link to="/app" activeProps={ACTIVE} inactiveProps={INACTIVE} className={ITEM}>
                Mis tareas
            </Link>
            <Link to="/profile" activeProps={ACTIVE} inactiveProps={INACTIVE} className={ITEM}>
                Mi perfil
            </Link>
        </nav>
        <nav aria-label="Principal" className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex h-16 items-center justify-around rounded-[1.4rem] border border-che-line/80 bg-che-paper/90 px-1 shadow-[0_12px_32px_rgba(32,35,34,.16)] backdrop-blur-xl sm:hidden">
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "bg-che-ink text-che-bg", "aria-current": "page" }} inactiveProps={{ className: "text-che-ink-soft" }} className={`flex min-h-11 min-w-16 flex-col items-center justify-center gap-0.5 rounded-xl px-3 text-[10px] font-bold transition active:scale-95 ${FOCUS_RING}`}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z"/><path d="M9 21v-6h6v6"/></svg>
                Inicio
            </Link>
            <Link to="/app" activeProps={{ className: "bg-che-ink text-che-bg", "aria-current": "page" }} inactiveProps={{ className: "text-che-ink-soft" }} className={`flex min-h-11 min-w-16 flex-col items-center justify-center gap-0.5 rounded-xl px-3 text-[10px] font-bold transition active:scale-95 ${FOCUS_RING}`}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M9 5h11M9 12h11M9 19h11M4 5h.01M4 12h.01M4 19h.01"/></svg>
                Tareas
            </Link>
            <Link to="/profile" activeProps={{ className: "bg-che-ink text-che-bg", "aria-current": "page" }} inactiveProps={{ className: "text-che-ink-soft" }} className={`flex min-h-11 min-w-16 flex-col items-center justify-center gap-0.5 rounded-xl px-3 text-[10px] font-bold transition active:scale-95 ${FOCUS_RING}`}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
                Perfil
            </Link>
        </nav>
        </>
    );
}
