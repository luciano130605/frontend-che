import { CheAvatar } from "../components/avatar/avatar";
import { useAvatarMood } from "../components/avatar/avatar-mood-context";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(
        () =>
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

        const handler = (e: MediaQueryListEvent) => {
            setReduced(e.matches);
        };

        mq.addEventListener("change", handler);

        return () => mq.removeEventListener("change", handler);
    }, []);

    return reduced;
}

export default function NotFound() {
    const { mood, followCursor, triggerMood, resetMood } = useAvatarMood();
    const reduceMotion = usePrefersReducedMotion();

    useEffect(() => {
        triggerMood("confused");

        return () => resetMood();
    }, [triggerMood, resetMood]);

    return (
        <section
            className="
                mx-auto flex max-w-[720px]
                flex-col items-center
                gap-6
                px-4
                pb-16
                pt-10
                text-center

                sm:gap-8
                sm:px-5
                sm:pt-16
            "
        >
            <div
                className={`
                    relative flex
                    h-[170px] w-[170px]
                    items-center justify-center

                    sm:h-[240px] sm:w-[240px]

                    ${reduceMotion ? "" : "che-float"}
                `}
            >
                <CheAvatar mood={mood} size={200} followCursor={followCursor} />
            </div>



            <div className={reduceMotion ? "" : "che-rise"}>
                <h1
                    className="
                        font-display
                        text-[1.7rem]
                        font-semibold
                        leading-[1.1]
                        tracking-tight

                        sm:text-[2.2rem]
                    "
                >
                    Che no encuentra esta página.
                </h1>

                <p
                    className="
                        mx-auto mt-3
                        max-w-[26rem]
                        text-[15px]
                        leading-relaxed
                        text-che-ink-soft

                        sm:mt-4
                        sm:text-base
                    "
                >
                    Se ve que se te perdió algo por el camino. Volvé al
                    inicio y le contás de nuevo qué tenés pendiente.
                </p>
            </div>

            <div
                className="
                    flex flex-col
                    items-stretch
                    gap-3

                    sm:flex-row
                    sm:items-center
                "
            >
                <Link
                    to="/"
                    onMouseEnter={() => triggerMood("listening")}
                    onMouseLeave={() => triggerMood("confused")}
                    className="
                        group relative inline-flex
                        min-h-11
                        items-center justify-center
                        overflow-hidden
                        rounded-xl
                        bg-che-ink
                        px-5
                        text-sm
                        font-semibold
                        text-che-bg

                        transition-all
                        duration-200
                        ease-out

                        hover:-translate-y-0.5
                        hover:bg-che-coral-dark
                        hover:shadow-che-sm
                        hover:shadow-che-ink

                        active:translate-y-0
                    "
                >
                    <span className="relative z-10">Volver al inicio</span>

                    <span
                        aria-hidden
                        className="
                            absolute inset-0
                            -translate-x-full
                            bg-che-coral
                            transition-transform
                            duration-300
                            ease-out
                            group-hover:translate-x-0
                        "
                    />
                </Link>
            </div>
        </section>
    );
}