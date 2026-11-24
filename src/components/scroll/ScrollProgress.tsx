import { useEffect, useRef } from "react";

export default function ScrollProgress() {
    const progressRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ticking = false;

        const update = () => {
            const scrollY = window.scrollY;
            const { scrollHeight, clientHeight } = document.documentElement;

            const scrollable = Math.max(1, scrollHeight - clientHeight);
            const progress = Math.min(1, Math.max(0, scrollY / scrollable));

            if (progressRef.current) {
                progressRef.current.style.transform = `scaleX(${progress})`;
            }

            if (trackRef.current) {
                trackRef.current.style.opacity = scrollY > 8 ? "1" : "0";
            }

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

    return (
        <div
            ref={trackRef}
            aria-hidden="true"
            className="
                pointer-events-none
                fixed
                inset-x-0
                top-0
                z-40
                h-[2px]
                overflow-hidden
                bg-che-line/30
                opacity-0
                transition-opacity
                duration-300
            "
            style={{
                paddingTop: "env(safe-area-inset-top)",
            }}
        >
            <div
                ref={progressRef}
                className="
                    h-full
                    w-full
                    origin-left
                    bg-gradient-to-r
                    from-che-coral-soft
                    via-che-coral
                    to-che-coral-dark
                    will-change-transform
                "
                style={{
                    transform: "scaleX(0)",
                }}
            />
        </div>
    );
}