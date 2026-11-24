import { useSession } from "../../auth";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

export type CheckoutPlan = {
    id: string;
    name: string;
    price: string;
    period?: string;
};

type Props = {
    plan: CheckoutPlan;
    onClose: () => void;
};

export function CheckoutModal({ plan, onClose }: Props) {
    const session = useSession();
    function handleRegistrarme() {
        window.location.href = session ? "/profile" : "/register";
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-che-ink/40 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[440px] rounded-2xl border border-che-line bg-che-paper p-6 shadow-che-lg shadow-che-ink sm:p-8"
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-2 rounded-full p-1.5 text-che-ink-soft transition-colors hover:bg-che-line/40 hover:text-che-ink"
                    aria-label="Cerrar"
                >
                    <HugeiconsIcon icon={Cancel01Icon} size={18} />
                </button>

                <div className="mb-6 rounded-xl border border-che-line bg-che-bg px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-che-ink-soft">
                        {plan.name}
                    </p>
                    <p className="text-lg font-semibold text-che-ink">
                        {plan.price}
                        {plan.period ? (
                            <span className="text-xs font-medium text-che-ink-soft"> {plan.period}</span>
                        ) : null}
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <h3 className="font-display text-lg font-semibold text-che-ink">
                            {session ? "Ya iniciaste sesión" : "Necesitás una cuenta"}
                        </h3>
                        <p className="mt-1 text-sm text-che-ink-soft">
                            {session ? "La contratación de planes pagos todavía no está disponible. Podés consultar tu suscripción actual desde tu perfil." : "Creá tu cuenta para continuar con el plan " + plan.name + "."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleRegistrarme}
                        className="mt-2 inline-flex min-h-11 items-center justify-center rounded-xl bg-che-ink px-5 text-sm font-semibold text-che-bg transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-che-sm hover:shadow-che-coral active:scale-[0.96]"
                    >
                        {session ? "Ver mi suscripción" : "Registrarme"}
                    </button>
                </div>
            </div>
        </div>
    );
}