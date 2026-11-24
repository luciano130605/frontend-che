import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
    extend: {
        classGroups: {
            shadow: [
                { shadow: ["che-sm", "che-md", "che-lg", "che-xl", "che-2xl"] },
            ],
            "shadow-color": [
                {
                    shadow: [
                        "che-ink",
                        "che-paper",
                        "che-coral",
                        "che-coral-dark",
                        "che-lav",
                        "che-mustard",
                    ],
                },
            ],
        },
    },
});

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}