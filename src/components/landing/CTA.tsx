import { ChevronRight } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";

export default function CTA() {
    return (
        <div className="group relative mx-auto mb-16 flex max-w-[90%] flex-col items-center gap-6 overflow-hidden rounded-[20px] border-2 border-che-ink bg-che-coral p-6 text-center text-che-ink shadow-che-2xl shadow-che-ink transition-transform duration-300 ease-out sm:mb-24 sm:flex-row sm:justify-between sm:gap-10 sm:rounded-[26px] sm:p-14 sm:text-left">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-che-ink/10 blur-2xl transition-transform duration-500 ease-out group-hover:scale-150 sm:-right-10 sm:-top-10 sm:h-40 sm:w-40" />

            <div className="relative">
                <h2 className="max-w-[480px] font-display text-xl font-semibold sm:text-2xl md:text-[2rem]">
                    Decile a Che qué tenés pendiente.
                </h2>

                <p className="mx-auto mt-2 max-w-[460px] text-sm text-che-ink/75 sm:mx-0 sm:mt-2.5 sm:text-base">
                    Escribilo como se lo dirías a un amigo. Che lo organiza,
                    lo prioriza y se encarga de recordártelo.
                </p>
            </div>

            <Link
                to="/register"
                className="group/btn relative inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-che-ink px-5 text-sm font-semibold text-che-bg transition-all duration-150 ease-out hover:bg-che-paper hover:text-che-ink hover:shadow-che-sm hover:shadow-che-ink active:scale-[0.96] sm:w-auto"
            >
                Empezar
                <HugeiconsIcon icon={ChevronRight}
                    size={16}
                    className="transition-transform duration-200 ease-out group-hover/btn:translate-x-2"
                />
            </Link>
        </div>
    );
}