import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import type { CheMood } from "./avatar";

type AvatarMoodContextValue = {
    mood: CheMood;
    followCursor: boolean;
    triggerMood: (mood: CheMood) => void;
    resetMood: () => void;
    setSelectionLock: (locked: boolean) => void;
};

const DEFAULT_MOOD: CheMood = "idle";
const SELECTION_MOOD: CheMood = "waking";

const AvatarMoodContext = createContext<AvatarMoodContextValue | null>(null);

export function AvatarMoodProvider({ children }: { children: ReactNode }) {
    const [mood, setMood] = useState<CheMood>(DEFAULT_MOOD);
    const [followCursor, setFollowCursor] = useState(true);
    const selectionLockedRef = useRef(false);

    const triggerMood = useCallback((next: CheMood) => {
        if (selectionLockedRef.current) return;
        setFollowCursor(false);
        setMood(next);
    }, []);

    const resetMood = useCallback(() => {
        if (selectionLockedRef.current) return;
        setMood(DEFAULT_MOOD);
        setFollowCursor(true);
    }, []);

    const setSelectionLock = useCallback((locked: boolean) => {
        selectionLockedRef.current = locked;
        setMood(locked ? SELECTION_MOOD : DEFAULT_MOOD);
        setFollowCursor(true);
    }, []);

    return (
        <AvatarMoodContext.Provider
            value={{ mood, followCursor, triggerMood, resetMood, setSelectionLock }}
        >
            {children}
        </AvatarMoodContext.Provider>
    );
}

export function useAvatarMood() {
    const ctx = useContext(AvatarMoodContext);
    if (!ctx) {
        throw new Error("useAvatarMood debe usarse dentro de <AvatarMoodProvider>");
    }
    return ctx;
}

export function useSectionMood(mood: CheMood, threshold = 0.5) {
    const { triggerMood, resetMood } = useAvatarMood();
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    triggerMood(mood);
                } else {
                    resetMood();
                }
            },
            { threshold }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [mood, threshold, triggerMood, resetMood]);

    return ref;
}