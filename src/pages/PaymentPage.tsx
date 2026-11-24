import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import Header from "../components/landing/Header";
import { CheAvatar } from "../components/avatar/avatar";
import { useSession } from "../auth";
import { confirmPayment, createCheckout, errorMessage } from "../lib/api";
import { CheckmarkBadge04FreeIcons, CircleX, Clock01Icon, LoaderIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type Result = "approved" | "pending" | "rejected";
type Step = "summary" | "redirecting" | "confirming" | Result;

const money = (amount: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount);

// Mismos precios que la página de planes (el backend es quien cobra el monto real).
const MONTHLY = 14999;
const ANNUAL_MONTHLY = 11999;

const results = {
  approved: { title: "¡Listo, salió todo bien!", copy: "Tu suscripción a Che Pro está activa. Ya tenés mensajes ilimitados y reorganización automática.", icon: CheckmarkBadge04FreeIcons },
  pending: { title: "Tu pago está pendiente", copy: "Mercado Pago todavía no confirmó la suscripción. Apenas la apruebe, tu plan se activa solo.", icon: Clock01Icon },
  rejected: { title: "No pudimos completar el pago", copy: "La suscripción no quedó activa. Podés volver a intentarlo con otro medio de pago.", icon: CircleX },
};

const ctaClass =
  "group relative inline-flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-xl border border-che-ink bg-che-ink p-3 font-semibold text-che-bg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-che-coral-dark hover:bg-che-coral-dark hover:shadow-che-sm hover:shadow-che-ink disabled:cursor-not-allowed disabled:opacity-50";

export default function PaymentPage({
  period,
  preapprovalId,
  onPeriodChange,
}: {
  period: "mensual" | "anual";
  preapprovalId?: string;
  onPeriodChange: (period: "mensual" | "anual") => void;
}) {
  const session = useSession();
  const [step, setStep] = useState<Step>(preapprovalId ? "confirming" : "summary");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const confirmedFor = useRef<string | null>(null);

  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  // Al volver de Mercado Pago, el backend consulta el estado real de la suscripción.
  useEffect(() => {
    if (!preapprovalId || confirmedFor.current === preapprovalId) return;
    confirmedFor.current = preapprovalId;

    confirmPayment(preapprovalId)
      .then(({ status }) => {
        setStep(status === "authorized" ? "approved" : status === "pending" ? "pending" : "rejected");
      })
      .catch((err) => {
        setError(errorMessage(err, "No pudimos verificar tu pago."));
        setStep("rejected");
      });
  }, [preapprovalId]);

  const annual = period === "anual";
  const monthly = annual ? ANNUAL_MONTHLY : MONTHLY;
  const total = monthly * (annual ? 12 : 1);
  const savings = (MONTHLY - ANNUAL_MONTHLY) * 12;
  const result = step === "approved" || step === "pending" || step === "rejected" ? results[step] : null;
  const features = ["Mensajes ilimitados", "Reprogramación automática si las tareas se pisan", "Historial de todo el tiempo"];

  async function pay() {
    if (step !== "summary") return;
    setError(null);
    setStep("redirecting");
    try {
      const { url } = await createCheckout(period);
      window.location.assign(url);
    } catch (err) {
      setError(errorMessage(err, "No pudimos iniciar el pago."));
      setStep("summary");
    }
  }

  return (
    <>
      <Header />
      <main className="relative mx-auto max-w-[1100px] px-5 py-10 sm:px-7 sm:py-16">
        <a href="/#precios" className="mb-8 inline-flex items-center gap-2 text-sm text-che-ink-soft hover:text-che-ink">Volver a los planes</a>
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-che-coral-dark">Un paso más, un pendiente menos</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">Dale más espacio a tu día.</h1>
            <p className="mt-3 text-sm text-che-ink-soft sm:text-base">Tu plan, tus tiempos. Che se ocupa de recordártelo.</p>
          </div>
          <div className="hidden sm:block"><CheAvatar size={100} mood={step === "approved" ? "happy" : "working"} /></div>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[1fr_360px]">
          <section className="order-2 rounded-2xl border border-che-line bg-che-paper p-6 sm:p-8 lg:order-1" aria-busy={step === "redirecting" || step === "confirming"}>
            <h2 ref={heading} tabIndex={-1} className="font-display text-2xl font-semibold outline-none">
              {result ? result.title : step === "summary" ? "Todo listo para continuar" : step === "confirming" ? "Confirmando tu pago…" : "Te llevamos a Mercado Pago…"}
            </h2>

            {step === "summary" && (
              <div className="mt-5 space-y-6">
                <p className="text-sm leading-relaxed text-che-ink-soft">
                  Vas a autorizar la suscripción en Mercado Pago, con tarjeta o dinero en cuenta. Se renueva sola y podés cancelarla cuando quieras.
                </p>
                {session && <p className="break-all rounded-xl bg-che-bg p-4 text-sm">Cuenta: <strong>{session.user.email}</strong></p>}
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
                  <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-che-coral-dark" />
                  <span>Acepto los <Link to="/terminos" className="underline">términos y condiciones</Link> y la <Link to="/privacidad" className="underline">política de privacidad</Link>.</span>
                </label>
                {error && <p role="alert" className="rounded-xl border border-che-coral bg-che-coral-soft p-3 text-sm font-medium text-che-ink">{error}</p>}
                <button disabled={!accepted} onClick={pay} className={ctaClass}>
                  <span className="relative z-10">Continuar a Mercado Pago</span>
                  <span aria-hidden className="absolute inset-0 -translate-x-full bg-che-coral transition-transform duration-300 ease-out group-hover:translate-x-0" />
                </button>
              </div>
            )}

            {(step === "redirecting" || step === "confirming") && (
              <div role="status" className="flex flex-col items-center gap-4 py-14 text-center">
                <HugeiconsIcon icon={LoaderIcon} className="animate-spin text-che-coral-dark" size={40} />
                <p className="text-sm text-che-ink-soft">{step === "confirming" ? "Estamos verificando tu suscripción con Mercado Pago." : "Un segundo, abrimos Mercado Pago."}</p>
              </div>
            )}

            {result && (
              <div className="mt-6 space-y-6">
                <HugeiconsIcon icon={result.icon} size={48} className="text-che-coral-dark" />
                <p role="status" className="text-sm leading-relaxed text-che-ink-soft">{error ?? result.copy}</p>
                {step === "rejected" ? (
                  <button className={ctaClass} onClick={() => { setError(null); setStep("summary"); }}>
                    <span className="relative z-10">Reintentar</span>
                  </button>
                ) : (
                  <Link to="/profile" className={ctaClass}>
                    <span className="relative z-10">Ir a mi cuenta</span>
                    <span aria-hidden className="absolute inset-0 -translate-x-full bg-che-coral transition-transform duration-300 ease-out group-hover:translate-x-0" />
                  </Link>
                )}
              </div>
            )}
          </section>

          <aside className="order-1 overflow-hidden rounded-2xl border border-che-ink bg-che-ink text-che-paper shadow-che-lg shadow-che-coral lg:order-2">
            <div className="p-6 sm:p-7">
              <span className="rounded-full bg-che-coral px-3 py-1 text-xs font-semibold text-che-ink">Tu próximo plan</span>
              <h2 className="mt-5 font-display text-3xl font-semibold">Che Pro</h2>
              <fieldset disabled={step !== "summary"} className="mt-5">
                <legend className="mb-2 text-xs text-che-paper/80">Elegí la frecuencia de pago</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(["mensual", "anual"] as const).map((value) => (
                    <label key={value} className={"relative cursor-pointer rounded-xl border px-3 py-3 text-center text-sm font-semibold transition focus-within:ring-2 focus-within:ring-che-coral " + (period === value ? "border-che-coral bg-che-coral text-che-ink" : "border-che-paper/30 hover:border-che-paper/70")}>
                      <input type="radio" name="billing-period" value={value} checked={period === value} onChange={() => onPeriodChange(value)} className="sr-only" />
                      {value === "mensual" ? "Mensual" : "Anual"}
                    </label>
                  ))}
                </div>
              </fieldset>
              <p className="mt-3"><strong className="text-4xl">{money(monthly)}</strong><span className="text-sm text-che-paper/70"> / mes</span></p>
              <p className="mt-2 text-xs text-che-paper/70">{annual ? "Facturación anual · 12 meses en un pago" : "Facturación mensual"}</p>
              {annual && <p className="mt-3 rounded-lg bg-che-coral/15 px-3 py-2 text-xs font-semibold text-che-coral">Ahorrás {money(savings)} al año frente al pago mensual.</p>}
              <ul className="my-6 space-y-3">{features.map((feature) => <li key={feature} className="flex gap-2 text-sm">{feature}</li>)}</ul>
              <p className="mb-5 text-xs text-che-coral">WhatsApp: disponible próximamente.</p>
              <div className="flex items-center justify-between gap-3 border-t border-che-paper/20 pt-5">
                <span className="text-sm">{annual ? "Total por 12 meses" : "Total por mes"}</span>
                <strong aria-live="polite" aria-atomic="true" className="text-xl">{money(total)}</strong>
              </div>
              <p className="mt-2 text-right text-xs text-che-paper/70">Pesos argentinos (ARS)</p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
