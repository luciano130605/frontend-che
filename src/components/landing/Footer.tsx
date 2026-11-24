import { Github, Instagram, NewTwitterIcon, } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useSession } from "../../auth";

function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
}

type FooterLink = {
    label: string;
    href?: string;
    sectionId?: string;
};

const PRODUCT_LINKS: FooterLink[] = [
    { label: "Cómo funciona", sectionId: "funciona" },
    { label: "Avisos", sectionId: "canales" },
    { label: "Precios", sectionId: "precios" },
];

const COMPANY_LINKS: FooterLink[] = [
    { label: "FAQs", href: "/Faqs" },
    { label: "Contacto", href: "/Contacto" },
];

const LEGAL_LINKS: FooterLink[] = [
    { label: "Términos", href: "/Terminos" },
    { label: "Privacidad", href: "/Privacidad" },
];

const SOCIAL_LINKS = [{ label: "Instagram", href: "https://www.instagram.com/", icon: Instagram, }, { label: "X (Twitter)", href: "https://x.com/", icon: NewTwitterIcon, },];

const FOCUS_RING =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-che-coral focus-visible:ring-offset-2 focus-visible:ring-offset-che-bg";

export default function Footer() {
    // "Producto" baja a secciones que solo existen en la landing pública: en el resto no se muestra.
    const session = useSession();
    const pathname = useRouterState({ select: (state) => state.location.pathname });
    const showProductLinks = !session && pathname === "/";

    return (
        <footer className="border-t border-che-line px-5 py-12 sm:px-7 sm:py-16">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col gap-10 sm:flex-row sm:justify-between sm:gap-12">
                    <div className="flex flex-col items-center gap-3 text-center sm:max-w-[20rem] sm:items-start sm:text-left">
                        <span className="font-display text-2xl font-semibold tracking-tight text-che-ink">
                            Che
                            <span className="font-medium italic text-che-coral">
                                .
                            </span>
                        </span>

                        <p className="max-w-xs text-sm leading-relaxed text-che-ink-soft">
                            Organizá tu día sin complicarte. Decile qué tenés que
                            hacer y Che se encarga del resto.
                        </p>

                        {/* <ul className="mt-1 flex items-center gap-1">
                            {SOCIAL_LINKS.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={link.label}
                                        className={`inline-flex h-9 w-9 gap-4 items-center justify-center rounded-xl border-none bg-none text-che-ink-soft transition-all duration-200  hover:text-che-ink active:translate-y-0 active:shadow-none ${FOCUS_RING}`}
                                    >
                                        <HugeiconsIcon icon={link.icon} size={20} />

                                    </a>
                                </li>
                            ))}
                        </ul> */}
                    </div>

                    <nav className="grid grid-cols-2 gap-x-10 gap-y-8 text-center sm:flex sm:flex-wrap sm:justify-end sm:gap-x-14 sm:text-left">
                        {showProductLinks && <FooterColumn title="Producto" links={PRODUCT_LINKS} />}
                        <FooterColumn title="Compañía" links={COMPANY_LINKS} />
                        <FooterColumn title="Legal" links={LEGAL_LINKS} />
                    </nav>
                </div>

                <div className="mt-5 flex items-center gap-3 border-t border-che-line pt-6 text-center text-xs text-che-ink-soft sm:flex-row justify-between sm:text-left">
                    <span>
                        © {new Date().getFullYear()} Che — Organizá tu día sin
                        complicarte
                    </span>
                    <button
                        type="button"
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: "smooth" })
                        }
                        className={`hidden items-center gap-1.5 rounded-lg text-che-ink-soft transition-colors duration-200 hover:text-che-ink sm:inline-flex ${FOCUS_RING}`}
                    >

                        Volver arriba
                    </button>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({
    title,
    links,
}: {
    title: string;
    links: FooterLink[];
}) {
    return (
        <div className="flex flex-col items-center gap-2 text-sm sm:items-start">
            <span className="mb-1 font-medium text-che-ink">{title}</span>

            {links.map((link) => {
                const className = `rounded-lg text-che-ink-soft transition-colors duration-200 hover:text-che-ink ${FOCUS_RING}`;

                if (link.sectionId) {
                    return (
                        <button
                            key={link.label}
                            type="button"
                            onClick={() => scrollToSection(link.sectionId!)}
                            className={className}
                        >
                            {link.label}
                        </button>
                    );
                }

                if (link.href?.startsWith("http")) {
                    return (
                        <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={className}
                        >
                            {link.label}
                        </a>
                    );
                }

                return (
                    <Link key={link.label} to={link.href ?? "/"} className={className}>
                        {link.label}
                    </Link>
                );
            })}
        </div>
    );
}
