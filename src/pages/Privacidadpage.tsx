import { useEffect } from "react";
import { LegalPageLayout, LegalSection } from "../components/landing/Layout";

export default function PrivacidadPage() {
    useEffect(() => {
        document.title = "Política de privacidad | Che";

        return () => {
            document.title = "Che — Organizá tu día sin complicarte";
        };
    }, []);

    return (
        <LegalPageLayout title="Política de privacidad" updatedAt="septiembre de 2026">
            <p className="text-sm leading-relaxed text-che-ink-soft">

            </p>

            <LegalSection heading="1. Qué datos recolectamos">
                <p>
                    Tu email y contraseña al crear la cuenta, tu número de teléfono para enviar
                    recordatorios si lo permitís, los mensajes que le escribís a Che para
                    organizarte y datos básicos de uso, como el plan que tenés y la cantidad de
                    mensajes que enviaste este mes.
                </p>

            </LegalSection>

            <LegalSection heading="2. Para qué los usamos">
                <p>
                    Para clasificar tus tareas, mandarte los avisos por email, Telegram o
                    push (según tu plan), y mejorar cómo Che entiende lo que le contás. No
                    usamos tus mensajes para entrenar modelos que otros usuarios puedan
                    ver.
                </p>
            </LegalSection>

            <LegalSection heading="3. Con quién los compartimos">
                <p>
                    No vendemos tus datos. Los compartimos únicamente con proveedores que
                    necesitamos para operar el servicio (por ejemplo, envío de notificaciones
                    por Telegram o procesamiento de pagos), y solo lo necesario para que
                    funcionen.
                </p>
            </LegalSection>

            <LegalSection heading="4. Seguridad">
                <p>
                    Tus datos viajan cifrados y guardamos las contraseñas de forma segura. Aun
                    así, ningún sistema es 100% infalible, así que te recomendamos usar una
                    contraseña única para tu cuenta de Che.
                </p>
            </LegalSection>

            <LegalSection heading="5. Tus derechos">
                <p>
                    Podés pedirnos en cualquier momento una copia de tus datos o que
                    eliminemos tu cuenta y todo tu historial. Escribinos a{" "}
                    <a href="mailto:ayuda@che.app" className="text-che-ink underline underline-offset-2">
                        ayuda@che.app
                    </a>{" "}
                    y lo resolvemos.
                </p>
            </LegalSection>

            <LegalSection heading="6. Almacenamiento en tu navegador">
                <p>
                    Che guarda datos en el almacenamiento local de tu navegador para
                    mantener tu sesión iniciada y recordar preferencias como el idioma o
                    los avisos que ya viste. No usamos cookies de publicidad ni de
                    seguimiento de terceros.
                </p>
            </LegalSection>

            <LegalSection heading="7. Cambios a esta política">
                <p>
                    Si cambiamos algo importante, te lo avisamos por email antes de que entre
                    en vigencia.
                </p>
            </LegalSection>
        </LegalPageLayout>
    );
}