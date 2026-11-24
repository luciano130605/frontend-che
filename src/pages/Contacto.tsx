import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

export default function ContactoPage() {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [sent, setSent] = useState(false);

    useEffect(() => {
        document.title = "Contacto | Che";

        return () => {
            document.title = "Che — Organizá tu día sin complicarte";
        };
    }, []);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!nombre || !email || !mensaje) return;
        setSent(true);
    }

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
                    <p className="text-xs font-medium text-che-coral">Contacto</p>
                    <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl md:text-[2.4rem]">
                        Escribinos
                    </h1>
                    <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-che-ink-soft">
                        Dudas, ideas o algo que no funcionó como esperabas: leemos
                        todo. Respondemos en menos de 48 horas hábiles.
                    </p>

                    <div className="mt-8 w-fit rotate-[-2deg] rounded-md border border-che-ink bg-che-paper px-4 py-3 text-che-ink shadow-che-sm shadow-che-ink lg:mt-10">
                        <p className="text-[11px] font-medium text-che-coral">
                            ESCRIBINOS DIRECTO
                        </p>
                        <a
                            href="mailto:ayuda@che.app"
                            className="group mt-0.5 block w-fit text-sm text-che-ink"
                        >
                            <span className="relative">
                                ayuda@che.app
                                <span className="absolute bottom-[-2px] left-0 h-px w-0 bg-che-ink-soft transition-all duration-300 group-hover:w-full" />
                            </span>
                        </a>
                    </div>
                </div>

                <div className="rounded-2xl border border-che-line bg-che-paper p-6 sm:p-8 md:p-10">
                    {sent ? (
                        <div>
                            <h2 className="font-serif text-2xl text-che-ink">
                                Listo, lo recibimos.
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-che-ink-soft break-words">
                                Te contestamos por email a {email} en cuanto lo leamos.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <label className="flex flex-col gap-2 text-sm text-che-ink">
                                    <span className="text-sm font-bold">
                                        Nombre
                                    </span>
                                    <input
                                        type="text"
                                        required
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        className="hide-scrollbar min-h-12 w-full max-h-32 flex-1 resize-none rounded-2xl border border-che-line bg-che-bg px-4 py-3 text-sm leading-relaxed text-che-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-che-ink-soft/70 focus:border-che-ink focus:shadow-che disabled:opacity-60 sm:min-h-11 sm:py-2.5"
                                    />
                                </label>
                                <label className="flex flex-col gap-2 text-sm text-che-ink">
                                    <span className="text-sm font-bold">
                                        Email
                                    </span>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="hide-scrollbar min-h-12 w-full max-h-32 flex-1 resize-none rounded-2xl border border-che-line bg-che-bg px-4 py-3 text-sm leading-relaxed text-che-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-che-ink-soft/70 focus:border-che-ink focus:shadow-che disabled:opacity-60 sm:min-h-11 sm:py-2.5"
                                    />
                                </label>
                            </div>
                            <label className="flex flex-col gap-2 text-sm text-che-ink">
                                <span className="text-sm font-bold">
                                    Mensaje
                                </span>
                                <textarea
                                    required
                                    rows={5}
                                    value={mensaje}
                                    onChange={(e) => setMensaje(e.target.value)}
                                    className="hide-scrollbar min-h-24 w-full max-h-64 flex-1 resize-none rounded-2xl border border-che-line bg-che-bg px-4 py-3 text-sm leading-relaxed text-che-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-che-ink-soft/70 focus:border-che-ink focus:shadow-che disabled:opacity-60"
                                />
                            </label>

                            <button
                                type="submit"
                                className="group relative flex h-12 w-full shrink-0 items-center justify-center overflow-hidden rounded-full bg-che-ink px-6 text-sm font-medium text-che-bg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-che-coral-dark hover:shadow-che-sm hover:shadow-che-ink active:scale-95 sm:w-auto sm:self-start"
                            >
                                <span className="relative z-10">Enviar</span>
                                <span className="absolute inset-0 -translate-x-full bg-che-coral transition-transform duration-300 ease-out group-hover:translate-x-0" />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}