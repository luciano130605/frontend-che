import { ChevronUp } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";


interface ScrollProps {
    className?: string;
}

export default function ScrollToTop({ className = "" }: ScrollProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let ticking = false;

        const update = () => {
            setVisible(window.scrollY > 420);
            ticking = false;
        };

        const onScroll = () => {
            if (ticking) return;

            ticking = true;
            requestAnimationFrame(update);
        };

        update();

        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <button
            type="button"
            onClick={scrollToTop}
            aria-label="Volver arriba"
            className={`
                group
                fixed
                right-4
                bottom-[calc(1rem+env(safe-area-inset-bottom))]
                z-50
                flex
                size-11
                items-center
                justify-center
                rounded-full
                border
                border-che-line/70
                bg-che-paper/30
                text-che-ink
                backdrop-blur-sm
                transition-all
                duration-200
                ease-out
                hover:bg-che-paper
                hover:-translate-y-0.5
                hover:border-che-ink
                hover:shadow-che-sm
                hover:shadow-che-ink
                active:translate-y-0
                active:scale-95
                active:shadow-none
                sm:right-6
                sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]
                ${visible
                    ? "translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none translate-y-4 scale-90 opacity-0"
                }
                ${className}
            `}
        >
            <HugeiconsIcon icon={ChevronUp}
                size={18}
                className="
                    transition-transform
                    duration-300
                    ease-out
                    group-hover:-translate-y-0.5
                "
            />
        </button>
    );
}
