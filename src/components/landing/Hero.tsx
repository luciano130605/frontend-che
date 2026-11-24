import { CheAvatar } from "../avatar/avatar";
import { useAvatarMood } from "../avatar/avatar-mood-context";
import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "@tanstack/react-router";


function useEntrance(delayMs: number, reduceMotion: boolean) {
    const [settled, setSettled] = useState(reduceMotion);

    useEffect(() => {
        if (reduceMotion) return;
        const t = setTimeout(() => setSettled(true), delayMs);
        return () => clearTimeout(t);
    }, [reduceMotion, delayMs]);

    return settled;
}

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

type PostitBg = "bg-che-coral-soft" | "bg-che-bg-2" | "bg-che-paper";

type PostitConfig = {
    id: string;
    bg: PostitBg;
    restTilt: number;
    tapeTilt: string;
    position: string;
    dropFrom: { x: number; y: number; rotate: number };
    delayMs: number;
    completed?: boolean;
    content: ReactNode;
};

const NOTES: PostitConfig[] = [
    {
        id: "raw",
        bg: "bg-che-coral-soft",
        restTilt: -8,
        tapeTilt: "-5deg",
        position: "left-0 top-0 sm:left-1 sm:top-2 md:left-2 md:top-3",
        dropFrom: { x: -30, y: -40, rotate: -22 },
        delayMs: 120,
        content: (
            <>
                <span className="block text-[11px] font-semibold text-che-ink-soft">
                    Casa
                </span>
                <b className="mt-1 block text-sm font-semibold leading-tight text-che-ink">
                    Pagar alquiler
                </b>
                <span className="mt-1 block text-xs text-che-ink-soft">
                    Viernes
                </span>
            </>
        ),
    },
    {
        id: "classified",
        bg: "bg-che-bg-2",
        restTilt: 6,
        tapeTilt: "4deg",
        position: "right-0 top-14 sm:top-16 md:top-20",
        dropFrom: { x: 34, y: -30, rotate: 18 },
        delayMs: 320,
        content: (
            <>
                <span className="block text-[11px] font-semibold text-che-ink-soft">
                    Facultad
                </span>
                <b className="mt-1 block text-sm font-semibold leading-tight text-che-ink">
                    Entregar el TP
                </b>
                <span className="mt-1 block text-xs text-che-ink-soft">
                    Martes
                </span>
            </>
        ),
    },
    {
        id: "reminder",
        bg: "bg-che-paper",
        restTilt: -3,
        tapeTilt: "6deg",
        position:
            "bottom-0 left-10 sm:bottom-2 sm:left-14 md:bottom-4 md:left-16",
        dropFrom: { x: -18, y: 36, rotate: -14 },
        delayMs: 520,
        completed: true,
        content: (
            <>
                <span className="block text-[11px] font-semibold text-che-ink-soft">
                    Personal
                </span>
                <b className="mt-1 block text-sm font-semibold leading-tight text-che-ink-soft line-through decoration-che-coral decoration-4">
                    Devolver libro
                </b>
                <span className="mt-1 block text-xs font-medium text-che-coral">
                    Hoy · Listo
                </span>
            </>
        ),
    },
];

function Postit({
    bg,
    restTilt,
    tapeTilt,
    position,
    dropFrom,
    delayMs,
    content,
    completed,
    reduceMotion,
    onMouseLeave,
}: PostitConfig & {
    reduceMotion: boolean;
    onMouseLeave: () => void;
}) {
    const settled = useEntrance(delayMs, reduceMotion);

    const transform = settled
        ? `rotate(${restTilt}deg)`
        : `translate(${dropFrom.x}px, ${dropFrom.y}px) rotate(${dropFrom.rotate}deg)`;

    return (
        <div
            aria-hidden="true"
            onMouseLeave={onMouseLeave}
            className={`
                group absolute z-[2] hidden w-[104px]
                sm:block sm:w-[124px] md:w-[136px]
                transition-[transform,opacity] duration-700 ease-out
                ${position}
                ${completed ? "opacity-85" : ""}
                ${settled ? "opacity-100" : "opacity-0"}
            `}
            style={{ transform } as CSSProperties}
        >
            <div
                className="absolute -top-2.5 left-1/2 z-[3] h-4 w-10 -translate-x-1/2 opacity-80 transition-opacity duration-300 group-hover:opacity-95"
                style={{
                    transform: `translateX(-50%) rotate(${tapeTilt})`,
                    background:
                        "color-mix(in srgb, var(--color-che-paper) 78%, var(--color-che-ink) 22%)",
                    border:
                        "1px solid color-mix(in srgb, var(--color-che-ink) 10%, transparent)",
                    clipPath: "polygon(2% 5%, 97% 0%, 100% 92%, 4% 100%)",
                    boxShadow:
                        "0 1px 2px color-mix(in srgb, var(--color-che-ink) 14%, transparent)",
                }}
            />

            <div
                className={`relative aspect-square w-full p-2.5 sm:p-3 md:p-3.5 ${bg}`}
                style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 92%, 92% 100%, 0 100%)",
                    boxShadow:
                        "0 1px 2px rgba(0,0,0,0.12), 3px 6px 10px rgba(0,0,0,0.16), 0 12px 20px -8px rgba(0,0,0,0.15)",
                }}
            >
                <div
                    className="absolute bottom-0 right-0 h-5 w-5"
                    style={{
                        clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
                        background:
                            "linear-gradient(135deg, transparent 0%, color-mix(in srgb, var(--color-che-ink) 14%, transparent) 100%)",
                        boxShadow:
                            "-1px -1px 2px color-mix(in srgb, var(--color-che-ink) 10%, transparent)",
                    }}
                />
                {content}
            </div>
        </div>
    );
}



export default function Hero() {
    const {
        mood,
        followCursor,
        resetMood,
        setSelectionLock,
    } = useAvatarMood();

    const reduceMotion = usePrefersReducedMotion();
    const titleSettled = useEntrance(0, reduceMotion);
    const bodySettled = useEntrance(150, reduceMotion);
    const ctaSettled = useEntrance(300, reduceMotion);
    const avatarSettled = useEntrance(200, reduceMotion);

    useEffect(() => {
        function handleSelectionChange() {
            const selection = window.getSelection();
            const selected =
                !!selection && selection.toString().trim().length > 0;
            setSelectionLock(selected);
        }

        document.addEventListener("selectionchange", handleSelectionChange);
        return () =>
            document.removeEventListener(
                "selectionchange",
                handleSelectionChange
            );
    }, [setSelectionLock]);

    return (
        <section
            className="
                mx-auto grid max-w-[1180px]
                items-center
                gap-5
                px-4
                pb-4
                pt-7

                sm:gap-10
                sm:px-5
                sm:pb-8
                sm:pt-12

                md:grid-cols-[1.1fr_0.9fr]
                md:gap-14
                md:px-7
                md:pt-16

                lg:gap-20
            "
        >
            <div className="text-center md:text-left">
                <h1
                    className={`
                        font-display
                        text-[2.1rem]
                        font-bold
                        leading-[1.05]
                        tracking-tight
                        text-che-ink
                        sm:text-[2.6rem]
                        sm:leading-[1.03]

                        md:text-[3.4rem]

                        lg:text-[3.9rem]

                        transition-[transform,opacity] duration-700 ease-out
                        ${titleSettled ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
                    `}
                >
                    Le contás qué hacer. Che lo ordena.
                </h1>

                <p
                    className={`
                        mx-auto mt-4
                        max-w-[28rem]
                        text-base
                        font-medium
                        leading-relaxed
                        text-che-ink-soft
                        sm:mt-6
                        sm:text-lg
                        md:mx-0

                        transition-[transform,opacity] duration-700 ease-out
                        ${bodySettled ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
                    `}
                >
                    Le escribís qué tenés que hacer y para cuándo. Che lo ordena, lo separa por tema y te avisa antes de que te olvides.
                </p>

                <div
                    className={`
                        mt-6
                        flex flex-col
                        items-center
                        gap-4

                        sm:mt-8
                        sm:flex-row
                        sm:justify-center

                        md:justify-start

                        transition-[transform,opacity] duration-500 ease-out
                        ${ctaSettled ? "scale-100 opacity-100" : "scale-95 opacity-0"}
                    `}
                >
                    <Link
                        to="/register"
                        onMouseLeave={resetMood}
                        className="
                            group relative inline-flex
                            min-h-12
                            items-center justify-center
                            overflow-hidden
                            rounded-xl
                            bg-che-ink
                            px-6
                            text-base
                            font-bold
                            tracking-tight
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
                        <span className="relative z-10">
                            Organizar mi semana
                        </span>

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
            </div>

            <div
                className={`
                    relative mx-auto
                    flex
                    h-[190px]
                    w-full
                    max-w-[260px]
                    items-center
                    justify-center
                    overflow-visible

                    sm:h-[320px]
                    sm:max-w-[380px]

                    md:h-[440px]
                    md:max-w-[480px]

                    transition-[transform,opacity] duration-700 ease-out
                    ${avatarSettled ? "scale-100 opacity-100" : "scale-90 opacity-0"}
                `}
            >

                <div className="relative z-[4] scale-[0.78] sm:scale-100">
                    <CheAvatar
                        mood={mood}
                        size={260}
                        followCursor={followCursor}
                    />
                </div>

                {NOTES.map((note) => (
                    <Postit
                        key={note.id}
                        {...note}
                        reduceMotion={reduceMotion}
                        onMouseLeave={resetMood}
                    />
                ))}
            </div>
        </section>
    );
}