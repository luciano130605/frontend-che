import type { ReactNode } from "react";

type ScrollContainerProps = {
    children: ReactNode;
};

export default function ScrollContainer({
    children,
}: ScrollContainerProps) {
    return (
        <div
            className="
                scroll-container
                min-h-screen
                overscroll-y-none
            "
        >
            {children}
        </div>
    );
}