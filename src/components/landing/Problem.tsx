import { NotebookTextIcon, ToggleOffFreeIcons, ToggleOnIcon } from "@hugeicons/core-free-icons";

import { useEffect, useRef, useState } from "react";

const problems = [
    {
        old: "Cuaderno o lista",
        title: "Lo anotás y te olvidás.",
        description:
            "Si no volvés a mirar la lista, se te puede pasar.",
        icon: NotebookTextIcon,
        accent: "coral",
    },
    {
        old: "Alarmas y recordatorios",
        title: "Configurar todo da fiaca.",
        description:
            "Elegir el día, la hora y repetirlo cada semana... demasiadas para una simple tarea.",
        icon: ToggleOffFreeIcons,
        hoverIcon: ToggleOnIcon,
        accent: "coral",
    },
    {
        old: "Notion y planificadores",
        title: "Organizarte lleva tiempo.",
        description:
            "Cargar, ordenar, categorizar y mantener todo al día termina siendo trabajo en sí mismo.",
        icon: NotebookTextIcon,
        accent: "coral",
    },
] as const;

type Accent = (typeof problems)[number]["accent"];

const accentStyles: Record<
    Accent,
    {
        cardHover: string;
        iconIdle: string;
        iconHover: string;
        strikeLine: string;
        glow: string;
    }
> = {
    coral: {
        cardHover: "hover:border-che-coral/50 hover:bg-che-coral/[0.08]",
        iconIdle: "bg-che-coral/10 text-che-coral",
        iconHover: "group-hover:bg-che-coral group-hover:text-che-ink",
        strikeLine: "bg-che-coral",
        glow: "hover:shadow-[0_0_0_1px_rgba(255,139,102,0.25)]",
    },

};

export default function Problem() {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLElement | null)[]>([]);
    const [active, setActive] = useState(0);
    const [struckThrough, setStruckThrough] = useState<boolean[]>(() =>
        problems.map(() => false)
    );

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const onScroll = () => {
            const cardWidth = el.scrollWidth / problems.length;
            const index = Math.round(el.scrollLeft / cardWidth);
            setActive(Math.min(Math.max(index, 0), problems.length - 1));
        };

        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const supportsHover =
            typeof window !== "undefined" &&
            window.matchMedia("(hover: hover)").matches;

        if (supportsHover) return;

        const observers: IntersectionObserver[] = [];

        cardRefs.current.forEach((node, index) => {
            if (!node) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setStruckThrough((prev) => {
                            if (prev[index]) return prev;
                            const next = [...prev];
                            next[index] = true;
                            return next;
                        });
                        observer.disconnect();
                    }
                },
                { threshold: 0.55 }
            );

            observer.observe(node);
            observers.push(observer);
        });

        return () => observers.forEach((observer) => observer.disconnect());
    }, []);

    const scrollToCard = (index: number) => {
        const el = scrollerRef.current;
        if (!el) return;
        const cardWidth = el.scrollWidth / problems.length;
        el.scrollTo({ left: cardWidth * index, behavior: "smooth" });
    };

    return (
        <section className="mt-8 bg-che-ink px-5 py-16 text-che-bg sm:px-7 sm:py-20 md:py-24">
            <div className="mx-auto max-w-[1180px]">
                <div className="mb-10 max-w-[720px] sm:mb-12 md:mb-14">

                    <h2 className="font-display text-[1.8rem] font-medium leading-[1.08] tracking-[-0.02em] sm:text-3xl md:text-[2.4rem]">
                        Organizarte no debería llevarte
                        <br className="hidden sm:block" /> tanto tiempo.
                    </h2>


                    <p className="mt-5 max-w-[600px] text-[15px] leading-7 text-che-bg/65 sm:text-base">
                        Entre anotar las cosas, poner alarmas y mantener todo ordenado, terminás gastando más tiempo organizándote que haciendo lo que tenés que hacer.
                    </p>
                </div>

                <div
                    ref={scrollerRef}
                    className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-7 sm:px-7 md:mx-0 md:grid md:grid-cols-3 md:gap-3 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden"
                >
                    {problems.map((problem, index) => {
                        const accent = accentStyles[problem.accent];
                        const isStruck = struckThrough[index];

                        return (
                            <article
                                key={problem.old}
                                ref={(node) => {
                                    cardRefs.current[index] = node;
                                }}
                                className={`group w-[100%] text-center flex-none snap-center rounded-2xl border border-che-bg/10 bg-che-bg/[0.035] p-5 transition-all duration-300 ease-out 5 sm:w-[55%] sm:p-6 md:w-auto md:p-7 ${accent.cardHover} ${accent.glow}`}
                            >
                               

                                <p className="relative mb-3 inline-block text-sm font-medium text-che-bg/45">
                                    {problem.old}
                                    <span
                                        className={`absolute left-0 top-1/2 h-[1.5px] w-full origin-left -translate-y-1/2 scale-x-0 transition-transform duration-[550ms] ease-out group-hover:scale-x-100 ${accent.strikeLine} ${isStruck ? "scale-x-100" : ""
                                            }`}
                                    />
                                </p>

                                <h3 className="font-display text-xl font-medium leading-tight sm:text-[1.35rem]">
                                    {problem.title}
                                </h3>

                                <p className="mt-4 text-sm leading-6 text-che-bg/55">
                                    {problem.description}
                                </p>
                            </article>
                        );
                    })}
                </div>

                <div className="mt-6 flex justify-center gap-2 md:hidden">
                    {problems.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => scrollToCard(index)}
                            aria-label={`Ir al problema ${index + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 ${active === index
                                ? "w-6 bg-che-coral"
                                : "w-1.5 bg-che-bg/20"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}