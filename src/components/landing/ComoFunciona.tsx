import { useEffect, useRef, useState } from "react";

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(
        () =>
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    return reduced;
}

function useInView(reduceMotion: boolean) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [inView, setInView] = useState(reduceMotion);

    useEffect(() => {
        if (reduceMotion) return;
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.25 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [reduceMotion]);

    return { ref, inView };
}

type Step = {
    title: string;
    description: string;
};

const STEPS: Step[] = [
    {
        title: "Le contás tu semana",
        description:
            "Le escribís como le hablarías a un amigo: qué tenés que hacer y para cuándo. Sin formularios ni campos que llenar.",
    },
    {
        title: "Che la ordena sola",
        description:
            "Separa cada cosa, la clasifica y le pone prioridad automáticamente. Vos no tenés que ordenar nada.",
    },
    {
        title: "Te avisa a tiempo",
        description:
            "Te lo recuerda por Email o Telegram, justo antes de que se te pase. Ni un segundo antes, ni un segundo después.",
    },
];

export default function ComoFunciona() {
    const reduceMotion = usePrefersReducedMotion();
    const { ref, inView } = useInView(reduceMotion);

    const scrollerRef = useRef<HTMLOListElement>(null);
    const [active, setActive] = useState(0);

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const onScroll = () => {
            const stepWidth = el.scrollWidth / STEPS.length;
            const index = Math.round(el.scrollLeft / stepWidth);
            setActive(Math.min(Math.max(index, 0), STEPS.length - 1));
        };

        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, []);

    const scrollToStep = (index: number) => {
        const el = scrollerRef.current;
        if (!el) return;
        el.scrollTo({
            left: (el.scrollWidth / STEPS.length) * index,
            behavior: "smooth",
        });
    };

    return (
        <section
            ref={ref}
            id="funciona"
            className="mx-auto max-w-[1180px] px-4 sm:px-5 md:px-7"
        >
            <div className="mx-auto max-w-[34rem] pt-2 text-center md:mx-0 md:max-w-[42rem] md:pt-0 md:text-left">
                <h2
                    className="
                        font-display text-[1.9rem] font-semibold
                        leading-[1.1] tracking-tight text-che-ink
                        sm:text-[2.35rem]
                    "
                >
                    Vos hablás. Che se encarga del resto.
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-che-ink-soft sm:text-lg">
                    Sin configurar categorías ni poner alarmas a mano. Tres
                    pasos y la semana queda ordenada.
                </p>
            </div>

            <ol
                ref={scrollerRef}
                className="
                    -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto
                    px-4 pb-2 sm:-mx-5 sm:mt-14 sm:px-5
                    [-ms-overflow-style:none] [scrollbar-width:none]
                    md:mx-0 md:mt-16 md:grid md:grid-cols-3 md:gap-6
                    md:overflow-visible md:px-0 md:pb-0
                    [&::-webkit-scrollbar]:hidden
                "
            >
                {STEPS.map((step, i) => {
                    return (
                        <li
                            key={step.title}
                            className="
                                group relative w-[100%] flex-none snap-center
                                sm:w-[58%] md:w-auto
                            "
                        >
                            <div
                                className={`
                                    relative h-full rounded-2xl border-che-line
                                    bg-che-paper p-6 sm:p-7
                                    transition-[transform,box-shadow,border-color]
                                    duration-300 ease-out
                                    hover:border-che-ink/20
                                    hover:shadow-che-md hover:shadow-che-ink/5
                                    ${inView
                                        ? "translate-y-0 opacity-100"
                                        : "translate-y-4 opacity-0"
                                    }
                                `}
                                style={{
                                    transitionDelay: inView
                                        ? `${i * 90}ms`
                                        : "0ms",
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        aria-hidden="true"
                                        className="
                                            inline-flex h-11 w-11 items-center justify-center
                                            rounded-xl border-che-ink bg-che-coral
                                            font-display text-lg font-semibold leading-none
                                            text-che-ink
                                            shadow-che-sm shadow-che-ink
                                            transition-transform duration-300 ease-out
                                            group-hover:-translate-y-0.5
                                        "
                                    >
                                        {i + 1}
                                    </span>
                                    <span className="h-px flex-1 bg-che-line" />
                                </div>

                                <h3 className="mt-4 font-display text-xl font-semibold leading-tight text-che-ink sm:text-[1.4rem]">
                                    {step.title}
                                </h3>

                                <p className="mt-2.5 text-sm leading-relaxed text-che-ink-soft sm:text-[15px]">
                                    {step.description}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>

            <div className="mt-6 flex justify-center gap-2 md:hidden">
                {STEPS.map((step, index) => (
                    <button
                        key={step.title}
                        type="button"
                        onClick={() => scrollToStep(index)}
                        aria-label={`Ir al paso ${index + 1}`}
                        className={`
                            h-1.5 rounded-full transition-all duration-300
                            ${active === index
                                ? "w-6 bg-che-coral"
                                : "w-1.5 bg-che-ink/20"
                            }
                        `}
                    />
                ))}
            </div>
        </section>
    );
}
