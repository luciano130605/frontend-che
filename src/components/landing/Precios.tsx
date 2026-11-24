import { useSession } from "../../auth";
import type { UserProfile } from "../../lib/api";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "../../lib/utils";
import { CheAvatar } from "../avatar/avatar";
import { useAvatarMood } from "../avatar/avatar-mood-context";
import { HugeiconsIcon } from "@hugeicons/react";
import { Check } from "@hugeicons/core-free-icons";


type BillingPeriod = "mensual" | "anual";

type Plan = {
    id: string;
    name: string;
    priceMonthly: string;
    priceAnnual: string;
    period?: string;
    features: string[];
    limitNote?: string;
    highlight?: boolean;
    cta: string;
    savingsNote?: string;
    requiresCheckout?: boolean;
};

const PLANS: Plan[] = [
    {
        id: "gratis",
        name: "Gratis",
        priceMonthly: "$0",
        priceAnnual: "$0",
        features: [
            "Recordatorios por email y Telegram",
            "Hasta 50 mensajes por mes",
            "Historial de 1 mes",
        ],
        cta: "Empezar gratis",
    },

    {
        id: "pro",
        name: "Che Pro",
        priceMonthly: "$14.999",
        priceAnnual: "$11.999",
        period: "/mes",
        limitNote: "Cuando llega WhatsApp.",
        savingsNote: "Ahorrás $36.000 al año",
        features: [
            "Recordatorios por email, Telegram y push",
            "Reprogramación automática si las tareas se pisan",

            "Mensajes ilimitados",
            "Historial de todo el tiempo",
            "Recordatorios por WhatsApp",
        ],
        cta: "Elegir Pro",
        requiresCheckout: true,
    },
];

export default function Precios({ profile = null, profileFailed = false }: { profile?: UserProfile | null; profileFailed?: boolean }) {
    const session = useSession();
    const { mood, followCursor, triggerMood, resetMood } = useAvatarMood();
    const [period, setPeriod] = useState<BillingPeriod>("mensual");


    return (
        <section
            id="precios"
            className="mx-auto max-w-[1180px] px-4 py-16 sm:px-7"
        >
            <div className="mb-10 flex flex-col items-center gap-5 text-center sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:text-left">
                <div className="max-w-[520px]">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-che-ink-soft">
                        Planes
                    </span>
                    <h2 className="font-display text-[1.75rem] font-semibold tracking-tight sm:text-[2.1rem]">
                        {session ? "Un plan que va con vos" : "Elegí cómo querés que Che te acompañe"}
                    </h2>
                </div>

                <div
                    className="hidden shrink-0 sm:block"
                    onMouseEnter={() => triggerMood("thinking")}
                    onMouseLeave={resetMood}
                >
                    <CheAvatar mood={mood} size={104} followCursor={followCursor} />
                </div>
            </div>

            {session && (
                <div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-che-line bg-che-paper px-5 py-4" role="status">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-che-ink-soft">Sesión iniciada</p>
                        <p className="mt-1 break-all text-sm font-medium">{session.user.email}</p>
                    </div>
                
                </div>
            )}
            <div className="mb-10 flex justify-center gap-2 sm:justify-start">
                <button
                    type="button"
                    aria-pressed={period === "mensual"}
                    onClick={() => setPeriod("mensual")}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all duration-150 ease-out sm:px-4",
                        period === "mensual"
                            ? "border-che-ink bg-che-coral text-che-bg shadow-che-sm shadow-che-ink"
                            : "border-che-line bg-che-paper text-che-ink-soft hover:-translate-y-0.5 hover:border-che-ink hover:text-che-ink hover:shadow-che-sm hover:shadow-che-ink active:translate-y-0 active:shadow-none"
                    )}
                >
                    Mensual
                </button>

                <button
                    type="button"
                    aria-pressed={period === "anual"}
                    onClick={() => setPeriod("anual")}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all duration-150 ease-out sm:px-4",
                        period === "anual"
                            ? "border-che-ink bg-che-coral text-che-bg shadow-che-sm shadow-che-ink"
                            : "border-che-line bg-che-paper text-che-ink-soft hover:-translate-y-0.5 hover:border-che-ink hover:text-che-ink hover:shadow-che-sm hover:shadow-che-ink active:translate-y-0 active:shadow-none"
                    )}
                >
                    Anual
                    <span
                        className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide",
                            period === "anual"
                                ? "bg-che-bg/60 text-che-ink"
                                : "bg-che-coral/20 text-che-coral-dark",
                        )}
                    >
                        -20%
                    </span>
                </button>
            </div>
            <div
                className={cn(
                    "mx-auto flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4",
                    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                    "sm:overflow-visible sm:px-0 sm:pb-0 sm:snap-none",
                    period === "anual"
                        ? "sm:max-w-[790px] sm:grid sm:grid-cols-2"
                        : "sm:grid sm:grid-cols-3",
                )}
            >
                {PLANS
                    .filter((plan) => period === "mensual" || plan.id !== "gratis")
                    .map((plan) => {
                        const isCurrent = !!session && profile?.plan === "FREE" && plan.id === "gratis";
                        const price =
                            period === "anual" ? plan.priceAnnual : plan.priceMonthly;

                        const ctaClassName = plan.highlight
                            ? "group relative mt-7 inline-flex min-h-11 items-center justify-center overflow-hidden rounded-xl border-none bg-che-coral px-5 text-sm font-semibold text-che-bg transition-all duration-150 ease-out hover:text-che-ink hover:shadow-che-sm hover:shadow-che-coral hover:-translate-y-0.5 active:scale-[0.96]"
                            : "mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-che-ink px-5 text-sm font-semibold text-che-bg transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-che-sm hover:shadow-che-coral active:scale-[0.96]";

                        return (
                            <div
                                key={plan.id}
                                onMouseLeave={resetMood}
                                className={cn(
                                    "relative flex w-[100%] shrink-0 snap-center flex-col rounded-2xl border p-6",
                                    "sm:w-auto sm:p-7",
                                    isCurrent && "ring-2 ring-che-coral ring-offset-4 ring-offset-che-bg",

                                    plan.highlight
                                        ? "border-2 border-che-ink bg-che-ink text-che-bg shadow-che-lg shadow-che-ink sm:-translate-y-3 sm:scale-[1.04]"
                                        : "border-che-line bg-che-paper",
                                )}
                            >
                                {isCurrent && <span className="absolute -top-3 right-6 rounded-full bg-che-coral-soft px-3 py-1 text-xs font-semibold text-che-ink">Tu plan actual</span>}
                                {plan.highlight ? (
                                    <span className="absolute -top-3 right-6 rounded-full bg-che-coral/70 backdrop-blur-md px-3 py-1 text-xs font-semibold text-che-ink hidden sm:flex">
                                        Recomendado
                                    </span>
                                ) : null}

                                <h3 className="mt-1 font-display text-xl font-semibold">
                                    {plan.name}
                                </h3>

                                <div className="mt-4 flex items-baseline gap-1">
                                    <span
                                        className={cn(
                                            "font-semibold",
                                            plan.highlight ? "text-4xl" : "text-3xl",
                                        )}
                                    >
                                        {price}
                                    </span>
                                    {plan.period ? (
                                        <span
                                            className={cn(
                                                "text-sm",
                                                plan.highlight ? "text-che-bg/70" : "text-che-ink-soft",
                                            )}
                                        >
                                            {plan.period}
                                        </span>
                                    ) : null}
                                </div>

                                {plan.savingsNote && period === "anual" ? (
                                    <p
                                        className={cn(
                                            "mt-1 text-xs font-medium",
                                            plan.highlight ? "text-che-coral" : "text-che-coral-dark",
                                        )}
                                    >
                                        {plan.savingsNote}
                                    </p>
                                ) : null}

                                <ul className="mt-6 flex flex-1 flex-col gap-2.5 text-sm">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2">
                                            <HugeiconsIcon icon={Check}
                                                size={15}
                                                className={cn(
                                                    "mt-0.5 shrink-0",
                                                    plan.highlight
                                                        ? "text-che-coral"
                                                        : "text-che-coral-dark",
                                                )}
                                            />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {plan.limitNote ? (
                                    <p
                                        className={cn(
                                            "mt-4 text-xs leading-snug",
                                            plan.highlight
                                                ? "font-medium text-che-coral"
                                                : "italic text-che-ink-soft",
                                        )}
                                    >
                                        {plan.limitNote}
                                    </p>
                                ) : null}

                                {isCurrent ? (
                                    <button type="button" disabled className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-che-line bg-che-bg px-5 text-sm font-semibold text-che-ink disabled:cursor-default">✓ Plan actual</button>
                                ) : plan.requiresCheckout ? (
                                    <Link
                                        to="/pagos"
                                        search={{ plan: "pro", periodo: period }}
                                        onMouseEnter={() => triggerMood("listening")}
                                        onMouseLeave={resetMood}
                                        className={ctaClassName}
                                    >
                                        <span className="relative z-10">{plan.cta}</span>
                                        {plan.highlight ? (
                                            <span
                                                aria-hidden
                                                className="absolute inset-0 -translate-x-full bg-che-paper transition-transform duration-300 ease-out group-hover:translate-x-0"
                                            />
                                        ) : null}
                                    </Link>
                                ) : (
                                    <Link
                                        to={session ? "/profile" : "/register"}
                                        onMouseLeave={resetMood}
                                        className={ctaClassName}
                                    >
                                        {session ? "Ver mi suscripción" : plan.cta}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
            </div>

            <p className="mt-3 text-center text-xs text-che-ink-soft sm:hidden">
                Deslizá para ver los diferentes planes
            </p>
        </section>
    );
}