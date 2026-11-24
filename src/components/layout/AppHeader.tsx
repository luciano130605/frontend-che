import { Link, useLocation } from "@tanstack/react-router";
import { CheAvatar } from "../avatar/avatar";
import { useSession } from "../../auth";
import MainNav from "./MainNav";

const FOCUS_RING =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-che-coral focus-visible:ring-offset-2 focus-visible:ring-offset-che-bg";

export default function AppHeader() {
    const session = useSession();
    // El nombre solo se muestra dentro del perfil. Cerrar sesión y eliminar la cuenta viven en el perfil.
    const isProfile = useLocation({ select: (location) => location.pathname.startsWith("/profile") });

    return (
        <header className="sticky top-0 z-30 border-b border-che-line bg-che-bg/85 backdrop-blur-md" style={{ paddingTop: "env(safe-area-inset-top)" }}>
            <div className="mx-auto flex h-14 max-w-295 items-center justify-between gap-2 px-4 sm:h-16 sm:px-7">
                <Link
                    to="/app"
                    className={`group flex shrink-0 items-center gap-2 rounded-lg font-display text-lg font-bold tracking-tight text-che-ink sm:text-2xl ${FOCUS_RING}`}
                >
                    <CheAvatar mood="working" size={36} className="scale-[0.68]" />
                    <span className="hidden sm:inline">
                        Che<span className="font-medium italic text-che-coral">.</span>
                    </span>
                </Link>

                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
                    <MainNav />
                    {isProfile && session?.user ? (
                        <span className="hidden text-sm text-che-ink-soft lg:inline">
                            {session.user.name || session.user.email}
                        </span>
                    ) : null}
                </div>
            </div>
        </header>
    );
}
