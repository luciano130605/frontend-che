import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "../../lib/utils";

export type CheckoutPlan = {
    id: string;
    name: string;
    price: string;
    period?: string;
};

type CheckoutStep = "registro" | "yendo-a-registro" | "pago" | "procesando" | "confirmacion";

type Props = {
    plan: CheckoutPlan;
    onClose: () => void;
};

export function CheckoutModal({ plan, onClose }: Props) {
    const [step, setStep] = useState<CheckoutStep>("registro");

    function handleRegistrarme() {
        // FICTICIO: /register todavía no está funcionando.
        // Por ahora simulamos la ida y vuelta con un alert + un delay corto,
        // así se puede probar el circuito completo (registro -> pago -> confirmación).
        //
        // TODO cuando /register funcione: reemplazar esto por
        //   navigate({ to: "/register", search: { plan: plan.id, next: "checkout" } })
        // y que /register, al terminar el alta con éxito, redirija de vuelta acá
        // (o a una página /checkout) para retomar en el paso de pago.
        alert("Esto en un rato te va a mandar a /register. Por ahora, simulamos que ya te registraste ✅");

        setStep("yendo-a-registro");
        setTimeout(() => {
            setStep("pago");
        }, 900);
    }

    function handlePagar() {
        setStep("procesando");

        // TODO: acá va la integración real con Mercado Pago (Checkout Pro / Checkout Bricks).
        // Por ahora simulamos el pago para probar el circuito completo.
        setTimeout(() => {
            setStep("confirmacion");
        }, 1800);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-che-ink/40 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-110 rounded-2xl border border-che-line bg-che-paper p-6 shadow-che-lg shadow-che-ink sm:p-8"
            >
                {step !== "procesando" && step !== "yendo-a-registro" ? (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-1.5 text-che-ink-soft transition-colors hover:bg-che-line/40 hover:text-che-ink"
                        aria-label="Cerrar"
                    >
                        Cerrar
                    </button>
                ) : null}

                {/* Resumen del plan */}
                <div className="mb-6 flex items-center justify-between rounded-xl border border-che-line bg-che-bg px-4 py-3">
                    <div>
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
                    {step === "registro" || step === "yendo-a-registro" ? (
                        <span className="rounded-full bg-che-coral/20 px-2.5 py-1 text-[10px] font-bold text-che-coral-dark">
                            1 de 2
                        </span>
                    ) : step === "pago" ? (
                        <span className="rounded-full bg-che-coral/20 px-2.5 py-1 text-[10px] font-bold text-che-coral-dark">
                            2 de 2
                        </span>
                    ) : step === "confirmacion" ? (
                        <span className="rounded-full bg-che-coral/20 px-2.5 py-1 text-[10px] font-bold text-che-coral-dark">
                            ✓
                        </span>
                    ) : null}
                </div>

                {step === "registro" ? (
                    <div className="flex flex-col gap-4">
                        <div>
                            <h3 className="font-display text-lg font-semibold text-che-ink">
                                Necesitás una cuenta
                            </h3>
                            <p className="mt-1 text-sm text-che-ink-soft">
                                Te llevamos a crear tu cuenta y después volvés acá para pagar.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleRegistrarme}
                            className="mt-2 inline-flex min-h-11 items-center justify-center rounded-xl bg-che-ink px-5 text-sm font-semibold text-che-bg transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-che-sm hover:shadow-che-coral active:scale-[0.96]"
                        >
                            Registrarme y continuar
                        </button>
                    </div>
                ) : null}

                {step === "yendo-a-registro" ? (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                        <p className="text-sm font-medium text-che-ink">Volviendo de /register...</p>
                    </div>
                ) : null}

                {step === "pago" ? (
                    <div className="flex flex-col gap-4">
                        <div>
                            <h3 className="font-display text-lg font-semibold text-che-ink">
                                Pagá con Mercado Pago
                            </h3>
                            <p className="mt-1 text-sm text-che-ink-soft">
                                Te vamos a redirigir a Mercado Pago para completar el pago de forma segura.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handlePagar}
                            className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#009ee3] px-5 text-sm font-semibold text-white transition-all duration-150 ease-out hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.96]"
                        >
                            Pagar con Mercado Pago
                        </button>

                        <p className="text-center text-[11px] text-che-ink-soft">
                            Pago 100% seguro. Podés cancelar tu suscripción cuando quieras.
                        </p>
                    </div>
                ) : null}

                {step === "procesando" ? (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                      
                        <p className="text-sm font-medium text-che-ink">Confirmando tu pago...</p>
                    </div>
                ) : null}

                {step === "confirmacion" ? (
                    <div className="flex flex-col items-center gap-3 py-4 text-center">
                        <h3 className="font-display text-lg font-semibold text-che-ink">
                            ¡Listo!
                        </h3>
                        <p className="text-sm text-che-ink-soft">
                            Tu plan {plan.name} está activo.
                        </p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-che-ink px-6 text-sm font-semibold text-che-bg transition-all duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.96]"
                        >
                            Ir a mi cuenta
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}