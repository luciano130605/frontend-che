import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheAvatar } from "../avatar/avatar";
import { useSession } from "../../auth";
import MainNav from "../layout/MainNav";

const COLLAPSE_AT = 96;
const DIRECTION_DELTA = 6;
const SETTLE_MS = 320;

const FOCUS_RING =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-che-coral focus-visible:ring-offset-2 focus-visible:ring-offset-che-bg";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const hasSession = useSession() !== null;
    const lastYRef = useRef(0);
    const settleUntilRef = useRef(0);

    const collapsedActive = collapsed && isMobile;
    const collapsedShrink = collapsed && !isMobile;


    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)");
        const handler = (e?: MediaQueryListEvent) => {
            const isDesktop = e ? e.matches : mq.matches;
            setIsMobile(!isDesktop);
        };
        handler();
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    useEffect(() => {
        lastYRef.current = window.scrollY;
        let ticking = false;

        const update = () => {
            const y = window.scrollY;

            if (Date.now() < settleUntilRef.current) {
                lastYRef.current = y;
                ticking = false;
                return;
            }

            const goingDown = y > lastYRef.current + DIRECTION_DELTA;
            const goingUp = y < lastYRef.current - DIRECTION_DELTA;

            setScrolled(y > 8);

            if (y <= 8) {
                setCollapsed(false);
                lastYRef.current = y;
            } else if (goingDown && y > COLLAPSE_AT) {
                setCollapsed(true);
                lastYRef.current = y;
                settleUntilRef.current = Date.now() + SETTLE_MS;
            } else if (goingUp) {
                setCollapsed(false);
                lastYRef.current = y;
                settleUntilRef.current = Date.now() + SETTLE_MS;
            }

            ticking = false;
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const buttonSize = collapsedShrink
        ? "min-h-7 px-3 text-xs"
        : "min-h-7 px-3 text-xs sm:min-h-9 sm:px-4 sm:text-sm";

    return (
        <header
            className={`
                sticky top-0 z-30
                transition-[transform,border-color,box-shadow,background-color] duration-300 ease-out
                motion-reduce:transition-none
                animate-in fade-in slide-in-from-top-2 duration-500 motion-reduce:animate-none
                ${collapsedActive
                    ? "-translate-y-full pointer-events-none"
                    : "translate-y-0"}
                border-b bg-che-bg/85 backdrop-blur-md
                ${scrolled
                    ? "border-che-line shadow-[0_8px_24px_-16px_rgba(0,0,0,0.25)]"
                    : "border-che-line/0"}
            `}
            style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
            <div className="mx-auto max-w-295 px-4 sm:px-7">
                <div
                    className={`
                        flex items-center justify-between gap-2 sm:gap-4
                        transition-[height] duration-300 ease-out
                        motion-reduce:transition-none
                        ${collapsedShrink ? "h-14 sm:h-12" : "h-14 sm:h-16"}
                    `}
                >
                    <Link
                        to="/"
                        className={`
                            group flex shrink-0 cursor-pointer items-center gap-2 rounded-lg
                            font-display text-lg font-bold tracking-tight text-che-ink
                            transition-transform duration-200 ease-out
                            active:scale-95
                            sm:text-2xl
                            ${FOCUS_RING}
                        `}
                    >
                        <span
                            className={`
                                inline-flex items-center justify-center
                                transition-transform duration-300 ease-out
                                ${collapsedActive ? "scale-100" : collapsedShrink ? "scale-[0.62]" : "scale-[0.68]"}
                            `}
                            style={{ transformOrigin: "center" }}
                        >
                            <CheAvatar
                                mood="working"
                                className="
                                    transition-transform duration-300 ease-out
                                    group-hover:-rotate-6 group-hover:scale-105
                                "
                                size={44}
                            />
                        </span>

                        <span
                            className={`
                                hidden overflow-hidden whitespace-nowrap font-semibold
                                transition-all duration-300 ease-out
                                sm:inline-flex
                                ${collapsedActive || collapsedShrink ? "max-w-0 opacity-0" : "max-w-20 opacity-100"}
                            `}
                        >
                            Che
                            <span
                                className="
                                    font-medium italic text-che-coral
                                    transition-colors duration-200 ease-out
                                    group-hover:text-che-coral-dark
                                "
                            >
                                .
                            </span>
                        </span>
                    </Link>

                    <div
                        className={`
                            flex shrink-0 items-center gap-2
                            transition-[max-width,opacity,transform] duration-300 ease-out
                            ${collapsedActive
                                ? "pointer-events-none max-w-0 overflow-hidden -translate-x-2 opacity-0"
                                : "max-w-90 overflow-visible translate-x-0 opacity-100"
                            }
                        `}
                    >
                        {hasSession ? (
                            <MainNav />
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className={`
                                        inline-flex items-center rounded-xl
                                        border border-che-line bg-che-paper
                                        font-semibold text-che-ink
                                        transition-all duration-300 ease-out
                                        hover:-translate-y-0.5 hover:border-che-ink
                                        hover:shadow-che-sm hover:shadow-che-ink
                                        active:translate-y-0 active:shadow-none
                                        ${FOCUS_RING}
                                        ${buttonSize}
                                    `}
                                >
                                    Ingresar
                                </Link>
                                <Link
                                    to="/register"
                                    className={`
                                        group relative inline-flex items-center gap-1.5
                                        overflow-hidden rounded-xl border border-che-ink bg-che-ink
                                        font-semibold text-che-bg
                                        transition-all duration-300 ease-out
                                        hover:-translate-y-0.5 hover:bg-che-coral-dark
                                        hover:border-che-coral-dark
                                        hover:shadow-che-sm hover:shadow-che-ink
                                        active:translate-y-0 active:shadow-none
                                        ${FOCUS_RING}
                                        ${buttonSize}
                                    `}
                                >
                                    <span className="relative z-10">Empezar</span>
                                    <span
                                        aria-hidden
                                        className="
                                            absolute inset-0 -translate-x-full bg-che-coral
                                            transition-transform duration-300 ease-out
                                            group-hover:translate-x-0
                                        "
                                    />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
