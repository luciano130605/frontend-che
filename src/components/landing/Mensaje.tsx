import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft02Icon,
    ArrowMoveUpRightIcon,
    CheckCheck,
    CheckIcon,
    ComingSoon02Icon,
    MoreVertical,
    Notification01Icon,
    StarIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "../../lib/utils";

type ChannelId = "push" | "telegram" | "whatsapp" | "email";

const CHANNELS: {
    id: ChannelId;
    label: string;
    plan?: string;
}[] = [
        { id: "telegram", label: "Telegram" },
        { id: "email", label: "Email" },
        { id: "push", label: "Push", plan: "Pro" },
        { id: "whatsapp", label: "WhatsApp", plan: "Premium" },
    ];

const MESSAGE =
    "Buen día 👋 Hoy tenés que entregar el TP antes de las 18 y a las 10 tenés reunión. El alquiler vence el viernes.";

function PhoneFrame({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto w-60 rounded-[28px] border-2 border-che-ink bg-che-ink p-2 shadow-che-lg shadow-che-ink sm:w-65 sm:rounded-[30px] sm:p-2.5 md:w-70 md:rounded-4xl">
            <div className="h-47.5 overflow-hidden rounded-[18px] bg-che-bg-2 sm:h-51.25 sm:rounded-[20px] md:h-55 md:rounded-[22px]">
                {children}
            </div>
        </div>
    );
}

function nowLabel() {
    return new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

function PushPreview() {
    return (
        <div className="flex flex-col items-center gap-3 sm:gap-4">
            <PhoneFrame>
                <div className="flex h-full flex-col gap-2 p-2.5 pt-6 sm:p-3 sm:pt-8">
                    <div className="rounded-2xl border border-che-line bg-che-paper/95 p-2.5 shadow-che-sm shadow-che-ink/40 sm:p-3">
                        <div className="flex items-center gap-2">
                            <img
                                src="/che-whatsapp.png"
                                alt="Che"
                                className="h-7 w-7 shrink-0 rounded-full object-cover sm:h-8 sm:w-8"
                            />
                            <span className="text-xs font-semibold">Che</span>
                            <span className="ml-auto shrink-0 text-[10px] text-che-ink-soft">ahora</span>
                        </div>
                        <p className="mt-1.5 text-[12px] leading-relaxed text-che-ink sm:text-[13px]">
                            {MESSAGE}
                        </p>
                    </div>
                </div>
            </PhoneFrame>


        </div>
    );
}

function TelegramPreview() {
    return (
        <div className="flex flex-col items-center gap-3 sm:gap-4">
            <PhoneFrame>
                <div className="flex items-center gap-2 bg-[#3391ed] px-3 py-2.5 text-white sm:gap-2.5 sm:px-3.5 sm:py-3">
                    <HugeiconsIcon icon={ArrowLeft02Icon} size={16} className="shrink-0 opacity-90" />
                    <img
                        src="/favicon-32x32.png"
                        alt="Che"
                        className="h-7 w-7 shrink-0 rounded-full object-cover ring-2 ring-white/30 sm:h-8 sm:w-8"
                    />
                    <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold leading-none sm:text-[13px]">Che</p>
                        <p className="mt-1 text-[10px] text-white/75">en línea</p>
                    </div>
                </div>
                <div
                    className="p-2.5 sm:p-3"
                    style={{
                        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)",
                        backgroundSize: "16px 16px",
                    }}
                >
                    <div className="max-w-[92%] rounded-xl rounded-tl-sm bg-white px-2.5 py-2 shadow-che-sm shadow-che-ink/20 sm:px-3 sm:py-2.5">
                        <p className="text-[12px] leading-relaxed text-che-ink sm:text-[13px]">{MESSAGE}</p>
                        <div className="mt-1.5 flex items-center justify-end gap-1">
                            <span className="text-[10px] text-che-ink-soft">{nowLabel()}</span>
                            <HugeiconsIcon icon={CheckCheck} size={13} className="shrink-0 text-[#54A9EB]" />
                        </div>
                    </div>
                </div>
            </PhoneFrame>
        </div>
    );
}

function EmailPreview() {
    const timeLabel = nowLabel();
    const dateLabel = new Date().toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
            <div className="w-full max-w-130 overflow-hidden rounded-xl border border-che-line bg-white shadow-che-lg shadow-che-ink/10">
                <div className="bg-white">
                    <div className="px-4 pb-1 pt-4 sm:px-5 sm:pt-5">
                        <div className="flex items-start gap-2">
                            <h3 className="min-w-0 flex-1 text-[17px] font-normal leading-tight tracking-[-0.01em] text-[#202124] sm:text-[19px]">
                                Tu resumen de hoy
                            </h3>
                            <span className="mt-0.5 shrink-0 rounded-full bg-[#f1f3f4] px-2 py-0.5 text-[9px] font-medium text-[#5f6368]">
                                Bandeja de entrada
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start gap-2.5 px-4 py-3 sm:px-5">
                        <img
                            src="/che-whatsapp.png"
                            alt="Che"
                            className="h-9 w-9 shrink-0 rounded-full object-cover sm:h-10 sm:w-10"
                        />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                                <p className="truncate text-[12px] font-semibold text-[#202124] sm:text-[13px]">Che</p>
                                <span className="truncate text-[11px] text-[#5f6368] sm:text-[12px]">&lt;hola@che.app&gt;</span>
                            </div>
                            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#5f6368]">
                                para mí
                                <span className="text-[8px]">▼</span>
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 text-[#5f6368]">
                            <div className="hidden text-right sm:block">
                                <p className="text-[10px] leading-tight">{timeLabel}</p>
                                <p className="text-[9px] leading-tight text-[#80868b]">{dateLabel}</p>
                            </div>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full">
                                <HugeiconsIcon icon={StarIcon} size={17} />
                            </span>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full">
                                <HugeiconsIcon icon={MoreVertical} size={17} />
                            </span>
                        </div>
                    </div>

                    <div className="mx-4 border-t border-[#f1f3f4] sm:mx-5" />

                    <div className="px-4 py-5 sm:px-7 sm:py-6">
                        <div className="max-w-155 text-[#202124]">
                            <p className="text-[13px] leading-[1.8] sm:text-[14px]">Buen día 👋</p>
                            <p className="mt-4 text-[13px] leading-[1.8] sm:text-[14px]">Este es tu resumen de hoy.</p>

                            <div className="my-5 rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] p-3 sm:p-4">
                                <div className="flex items-start gap-2.5">
                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-che-coral text-white">
                                        <HugeiconsIcon icon={CheckIcon} size={11} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[12px] font-semibold text-[#202124] sm:text-[13px]">10:00 · Reunión</p>
                                        <p className="mt-0.5 text-[11px] leading-relaxed text-[#5f6368]">
                                            Preparar los temas antes de conectarte.
                                        </p>
                                    </div>
                                </div>

                                <div className="my-3 border-t border-[#e5e7eb]" />

                                <div className="flex items-start gap-2.5">
                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-che-coral text-white">
                                        <HugeiconsIcon icon={CheckIcon} size={11} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[12px] font-semibold text-[#202124] sm:text-[13px]">18:00 · Entregar TP</p>
                                        <p className="mt-0.5 text-[11px] leading-relaxed text-[#5f6368]">
                                            No te olvides de subir la entrega.
                                        </p>
                                    </div>
                                </div>

                                <div className="my-3 border-t border-[#e5e7eb]" />

                                <div className="flex items-start gap-2.5">
                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] text-[#5f6368]">
                                        <span className="text-[10px]">$</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[12px] font-semibold text-[#202124] sm:text-[13px]">Viernes · Alquiler</p>
                                        <p className="mt-0.5 text-[11px] leading-relaxed text-[#5f6368]">Tenelo presente esta semana.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[#f1f3f4] px-4 py-4 sm:px-5">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#dadce0] px-4 py-2 text-[11px] font-medium text-[#3c4043]">
                            <HugeiconsIcon icon={ArrowMoveUpRightIcon} size={14} />
                            Reenviar
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WhatsappPreview() {
    return (
        <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="relative">
                <PhoneFrame>
                    <div className="flex items-center gap-2 bg-[#075E54] px-3 py-2.5 text-white sm:gap-2.5 sm:px-3.5 sm:py-3">
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={16} className="shrink-0 opacity-90" />
                        <img
                            src="/che-whatsapp.png"
                            alt="Che"
                            className="h-7 w-7 shrink-0 rounded-full object-cover ring-2 ring-white/25 sm:h-8 sm:w-8"
                        />
                        <div className="min-w-0">
                            <p className="truncate text-[12px] font-semibold leading-none sm:text-[13px]">Che</p>
                            <p className="mt-1 text-[10px] text-white/70">en línea</p>
                        </div>
                    </div>
                    <div
                        className="p-2.5 sm:p-3"
                        style={{
                            backgroundColor: "#E5DDD5",
                            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)",
                            backgroundSize: "18px 18px",
                        }}
                    >
                        <div className="max-w-[92%] rounded-xl rounded-tl-sm bg-[#DCF8C6] px-2.5 py-2 shadow-che-sm shadow-che-ink/20 sm:px-3 sm:py-2.5">
                            <p className="text-[12px] leading-relaxed text-che-ink sm:text-[13px]">{MESSAGE}</p>
                            <div className="mt-1.5 flex items-center justify-end gap-1">
                                <span className="text-[10px] text-che-ink-soft">{nowLabel()}</span>
                                <HugeiconsIcon icon={CheckCheck} size={13} className="shrink-0 text-[#54A9EB]" />
                            </div>
                        </div>
                    </div>
                </PhoneFrame>
                <div className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-che-bg/70 backdrop-blur-[1px] sm:rounded-[30px] md:rounded-4xl">
                    <span className="rounded-full border border-che-ink bg-che-paper px-3.5 py-1.5 text-xs font-semibold sm:px-4">
                        Próximamente
                    </span>
                </div>
            </div>

         
        </div>
    );
}

export default function Mensaje() {
    const [active, setActive] = useState<ChannelId>("telegram");

    return (
        <section id="canales" className="mx-auto max-w-295 px-4 py-14 sm:px-5 sm:py-20 md:px-7 md:py-24">
            <div className="grid items-center gap-8 md:grid-cols-[1fr_1fr] md:gap-12">
                <div className="text-center md:text-left">
                    <h2 className="mx-auto max-w-115 font-display text-[1.7rem] font-semibold tracking-tight sm:text-[1.9rem] md:mx-0 md:text-[2.1rem]">
                        Esto es lo que te llega a la mañana.
                    </h2>
                    <p className="mx-auto mt-3 max-w-105 text-base leading-relaxed text-che-ink-soft sm:text-lg md:mx-0">
                        Elegí por dónde te avisamos. Push y WhatsApp según tu plan; Telegram y Email
                        están siempre incluidos. Vinculá tu canal desde tu perfil una vez que creés tu cuenta.
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-2 sm:mt-7 md:justify-start">
                        {CHANNELS.map((ch) => {
                            const isActive = active === ch.id;
                            return (
                                <button
                                    key={ch.id}
                                    type="button"
                                    onClick={() => setActive(ch.id)}
                                    className={cn(
                                        "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all duration-150 ease-out sm:px-4",
                                        isActive
                                            ? "border-che-ink bg-che-coral text-che-bg shadow-che-sm shadow-che-ink"
                                            : "border-che-line bg-che-paper text-che-ink-soft hover:-translate-y-0.5 hover:border-che-ink hover:text-che-ink hover:shadow-che-sm hover:shadow-che-ink active:translate-y-0 active:shadow-none"
                                    )}
                                >
                                    {ch.label}
                                    {ch.plan ? (
                                        <span
                                            className={cn(
                                                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                                                isActive ? "bg-che-bg/20 text-che-bg" : "bg-che-coral-soft text-che-coral-dark",
                                            )}
                                        >
                                            {ch.plan}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="w-full">
                    {active === "push" && <PushPreview />}
                    {active === "telegram" && <TelegramPreview />}
                    {active === "email" && <EmailPreview />}
                    {active === "whatsapp" && <WhatsappPreview />}
                </div>
            </div>
        </section>
    );
}
