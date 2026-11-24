import { useEffect } from "react";
import { LegalPageLayout, LegalSection } from "../components/landing/Layout";

export default function TerminosPage() {
    useEffect(() => {
        document.title = "Términos y condiciones | Che";

        return () => {
            document.title = "Che — Organizá tu día sin complicarte";
        };
    }, []);

    return (
        <LegalPageLayout title="Términos y condiciones" updatedAt="septiembre de 2026">
            <p className="text-sm leading-relaxed text-che-ink-soft">

            </p>

            <LegalSection heading="1. Qué es Che">
                <p>
                    Che es un servicio que recibe mensajes sobre tu semana en lenguaje
                    natural y lo organiza en tareas con fecha y categoría. Al crear una cuenta,
                    aceptás estos términos.
                </p>
            </LegalSection>

            <LegalSection heading="2. Tu cuenta">
                <p>
                    Sos responsable de mantener segura tu cuenta y de la información que nos
                    compartís. Si detectás un uso no autorizado, avisanos.
                </p>
            </LegalSection>

            <LegalSection heading="3. Planes y pagos">
                <p>
                    Che tiene un plan Gratis (hasta 20 mensajes por mes, recordatorios por
                    email y Telegram, e historial de 1 mes) y los planes pagos Plus (hasta 50
                    mensajes por mes, recordatorios por email, Telegram y push, historial de 1
                    año, y reprogramación automática de tareas que se pisan) y Pro (mensajes
                    ilimitados, historial de todo el tiempo, y recordatorios por WhatsApp
                    cuando esté disponible), con cobro mensual o anual. Podés cambiar o
                    cancelar tu plan en cualquier momento desde tu cuenta; los cambios aplican
                    a partir del próximo ciclo de facturación.
                </p>
            </LegalSection>

            <LegalSection heading="4. Uso aceptable">
                <p>
                    Usá Che para organizar tus propias tareas. No está permitido usarlo para
                    enviar contenido ilegal, spam, o para intentar automatizar el
                    servicio.
                </p>
            </LegalSection>

            <LegalSection heading="5. Propiedad intelectual">
                <p>
                    El nombre Che, su marca y su diseño son propiedad de Che. Las tareas y
                    mensajes que vos cargás siguen siendo tuyos.
                </p>
            </LegalSection>

            <LegalSection heading="6. Cambios en el servicio">
                <p>
                    Podemos actualizar o discontinuar funciones de Che. Si un cambio afecta
                    significativamente tu plan, te lo vamos a avisar con anticipación.
                </p>
            </LegalSection>

            <LegalSection heading="7. Límite de responsabilidad">
                <p>
                    Che te ayuda a organizarte, pero no reemplaza tu propio criterio. No nos
                    hacemos responsables por decisiones tomadas únicamente en base a los
                    recordatorios de la app.
                </p>
            </LegalSection>

            <LegalSection heading="8. Contacto">
                <p>
                    ¿Dudas sobre estos términos? Escribinos a{" "}
                    <a href="mailto:ayuda@che.app" className="text-che-ink underline underline-offset-2">
                        ayuda@che.app
                    </a>
                    .
                </p>
            </LegalSection>
        </LegalPageLayout>
    );
}