import type { ReactNode } from "react";

export function LegalPageLayout({
    title,
    updatedAt,
    children,
}: {
    title: string;
    updatedAt: string;
    children: ReactNode;
}) {
    return (
        <main className="bg-che-bg px-5 py-14 sm:px-7 sm:py-20">
            <div className="mx-auto max-w-2xl">
                <a
                    href="/"
                    className="group mb-8 inline-flex items-center gap-1.5 text-sm text-che-ink-soft transition-colors hover:text-che-ink"
                >
                    Volver al inicio
                </a>

                <p className="text-xs font-medium text-che-coral">Legal</p>
                <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-che-ink sm:text-3xl md:text-[2.4rem]">
                    {title}
                </h1>
                <p className="mt-2 text-sm text-che-ink-soft">
                    Última actualización: {updatedAt}
                </p>

                <div className="mt-10 flex flex-col gap-8">{children}</div>
            </div>
        </main>
    );
}

export function LegalSection({
    heading,
    children,
}: {
    heading: string;
    children: ReactNode;
}) {
    return (
        <section className="flex flex-col gap-3 border-t border-che-line bg-che-paper px-5 py-4 rounded-2xl pt-8 first:border-t-0 first:pt-0">
            <h2 className="text-lg font-semibold text-che-ink">{heading}</h2>
            <div className="flex flex-col gap-3 text-sm leading-relaxed text-che-ink-soft">
                {children}
            </div>
        </section>
    );
}