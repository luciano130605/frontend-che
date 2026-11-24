import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "che-cookie-consent";

export default function Cookies() {
  const [status, setStatus] = useState<"pending" | "visible" | "hidden">(
    "pending"
  );

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setStatus(stored ? "hidden" : "visible");
    } catch {
      setStatus("visible");
    }

    const t = setTimeout(() => {
      setStatus((s) => (s === "pending" ? "visible" : s));
    }, 600);
    return () => clearTimeout(t);
  }, []);

  function save(value: "accepted" | "rejected") {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* localStorage no disponible, seguimos igual */
    }
    setStatus("hidden");
  }

  if (status === "hidden") return null;

  const shown = status === "visible";

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de almacenamiento local"
      className={`
                fixed inset-x-4 bottom-6 z-50
                transition-[transform,opacity] duration-500 ease-out
                sm:inset-x-auto sm:left-6 sm:right-auto sm:max-w-[22rem]
                ${shown
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0 pointer-events-none"}
            `}
    >
      <div
        className="
                    relative overflow-hidden rounded-[26px]
                    border-2 border-che-ink bg-che-coral
                    p-5 text-che-ink
                    shadow-che-2xl shadow-che-ink
                    sm:p-6
                "
      >
        <span
          aria-hidden
          className="
                        absolute -right-4 -top-4 h-16 w-16 rounded-full
                        bg-che-bg/15
                    "
        />

        <div className="relative flex items-start gap-3">

          <div>
            <p className="mt-1 text-[13px] leading-relaxed text-che-ink/85">
              Che guarda datos en tu navegador (almacenamiento local) para mantener tu
              sesión y recordar tus preferencias. No usamos cookies de publicidad ni de
              seguimiento. Podés ver más en nuestra{" "}
              <Link
                to="/privacidad"
                className="
                                    font-medium text-che-bg underline
                                    underline-offset-2 decoration-che-bg/40
                                    transition-colors duration-150 ease-out
                                    hover:text-che-paper hover:decoration-che-paper
                                    focus-visible:outline-none focus-visible:ring-2
                                    focus-visible:ring-che-ink focus-visible:ring-offset-2
                                "
              >
                política de privacidad
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="relative mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => save("rejected")}
            className="
                            inline-flex min-h-9 items-center r
                            text-sm font-semibold text-che-bg-2
                            transition-all duration-300 ease-out
                            hover:text-che-bg
                        "
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => save("accepted")}
            className="
              group relative inline-flex items-center gap-1.5
              overflow-hidden rounded-xl border border-che-ink bg-che-ink
              px-4 min-h-9
              text-sm font-semibold text-che-bg
              transition-all duration-300 ease-out
              hover:-translate-y-0.5 hover:bg-che-coral-dark
              hover:border-che-coral-dark
              hover:shadow-che-sm hover:shadow-che-ink
               hover:text-che-ink
              active:translate-y-0 active:scale-[0.96] active:shadow-none
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-che-ink focus-visible:ring-offset-2
            "
          >
            <span className="relative z-10">Aceptar</span>
            <span
              aria-hidden
              className="
                absolute inset-0 -translate-x-full bg-che-bg
                transition-transform duration-300 ease-out
                group-hover:translate-x-0
              "
            />
          </button>
        </div>
      </div>
    </div>
  );
}