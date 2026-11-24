import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";


const FAQS = [
    {
        question: "¿Cómo le cuento mi semana a Che?",
        answer:
            "Le escribís como le escribirías en lenguaje natural: \"tengo que pagar el alquiler el viernes y entregar el TP el martes\". Che separa cada tarea, la clasifica y le pone fecha.",
    },
    {
        question: "¿Tengo que instalar algo?",
        answer:
            "No. Che funciona desde el navegador y te avisa por email y Telegram. Si estás en Plus o Pro, también te llegan notificaciones push.",
    },
    {
        question: "¿Qué pasa si supero los 50 mensajes del plan gratis?",
        answer:
            "Cuando llegás a los 20 mensajes mensuales, ya no podés enviar más mensajes en el plan Gratis. Podés esperar al próximo mes para volver a usarlos, pasar a Plus para tener 50 mensajes mensuales, o a Pro para mensajes ilimitados.",
    },
    {
        question: "¿Puedo cambiar o cancelar mi plan cuando quiera?",
        answer:
            "Sí, podés subir, bajar o cancelar tu plan cuando quieras desde tu cuenta. No hay permanencia mínima.",
    },
    {
        question: "¿Che guarda mis tareas de años anteriores?",
        answer:
            "Depende del plan: en Gratis el historial se limita al último mes, con Plus tenés historial completo del último año, y con Pro accedés al historial de todo el tiempo.",
    },
    {
        question: "¿Mis datos están seguros?",
        answer:
            "Sí. Tus mensajes y tareas solo se usan para organizarte a vos; no los compartimos con terceros.",
    },
];

export default function FaqsPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    useEffect(() => {
        document.title = "FAQs | Che";

        return () => {
            document.title = "Che — Organizá tu día sin complicarte";
        };
    }, []);

    return (
        <main className="bg-che-bg px-5 py-14 sm:px-7 sm:py-20">
            <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-14">
                <div>
                    <Link
                        to="/"
                        className="group mb-6 inline-flex items-center gap-1.5 text-sm text-che-ink-soft transition-colors hover:text-che-ink"
                    >
                        Volver al inicio
                    </Link>
                    <p className="text-xs font-medium text-che-coral">
                        Preguntas frecuentes
                    </p>
                    <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl md:text-[2.4rem]">
                        Lo que la gente nos pregunta
                    </h1>
                    <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-che-ink-soft">
                        Si tenés una duda que no está acá, escribinos directo y te
                        contestamos nosotros.
                    </p>

                    <div className="mt-8 w-fit rotate-[-2deg] rounded-md border border-che-ink bg-che-paper px-4 py-3 text-che-ink shadow-che-sm shadow-che-ink lg:mt-10">
                        <p className="text-[11px] font-medium text-che-coral">
                            ¿NO ESTÁ TU DUDA?
                        </p>
                        <Link
                            to="/contacto"
                            className="group mt-0.5 block w-fit text-sm text-che-ink"
                        >
                            <span className="relative">
                                Escribinos
                                <span className="absolute bottom-[-2px] left-0 h-px w-0 bg-che-ink-soft transition-all duration-300 group-hover:w-full" />
                            </span>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {FAQS.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={faq.question}
                                className="rounded-2xl border border-che-line bg-che-paper px-5 py-4 transition-shadow duration-150 sm:px-6 sm:py-5"
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="flex w-full items-center justify-between gap-4 text-left"
                                    aria-expanded={isOpen}
                                >
                                    <span className="text-sm font-bold text-che-ink sm:text-[15px]">
                                        {faq.question}
                                    </span>
                                    <span className="flex-shrink-0 text-xl text-che-ink-soft transition-colors duration-150 hover:text-che-ink">
                                        {isOpen ? "−" : "+"}
                                    </span>
                                </button>
                                <div
                                    className={`grid transition-all duration-200 ease-out ${isOpen
                                        ? "mt-3 grid-rows-[1fr] opacity-100"
                                        : "grid-rows-[0fr] opacity-0"
                                        }`}
                                >
                                    <p className="overflow-hidden text-sm leading-relaxed text-che-ink-soft">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}