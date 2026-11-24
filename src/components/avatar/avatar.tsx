import { Avatar } from "@bible-strong/avatar-react";
import {
    validateAvatarDefinition,
    type AvatarDefinition,
} from "@bible-strong/avatar-core";
import "@bible-strong/avatar-react/styles.css";
import { useCallback, useEffect, useReducer, useRef } from "react";
import rawChe from "../../data/avatar.json";
import { cn } from "../../lib/utils";

export type CheMood =
    | "idle"
    | "listening"
    | "thinking"
    | "waking"
    | "working"
    | "searching"
    | "happy"
    | "confused"
    | "proud"
    | "curious"
    | "celebrate"
    | "suspicious"
    | "surprised";

const validated = validateAvatarDefinition(rawChe);
if (!validated.ok) {
    throw new Error(validated.errors[0]?.message ?? "Avatar de Che inválido");
}
const definition = validated.value as AvatarDefinition;

const CURSOR_TRACK_KEY = "cursor-track";

const TRACK_SHAPE_BY_MOOD: Partial<Record<CheMood, string>> = {
    waking: "eyes-closed",
};

function createTrackingDefinition(base: AvatarDefinition): AvatarDefinition {
    const neutral = base.expressions.neutral;
    return {
        ...base,
        expressions: {
            ...base.expressions,
            [CURSOR_TRACK_KEY]: {
                head: { x: 0, y: 0, z: 0 },
                eyes: {
                    left: { ...neutral.eyes.left, x: 0, y: 0 },
                    right: { ...neutral.eyes.right, x: 0, y: 0 },
                    spacing: neutral.eyes.spacing,
                },
                perspective: neutral.perspective,
                motion: { eyes: "none", body: "none" },
            },
        },
        expressionOrder: [...base.expressionOrder, CURSOR_TRACK_KEY],
    };
}

type CheAvatarProps = {
    mood?: CheMood;
    size?: number;
    className?: string;
    followCursor?: boolean;
    followIntensity?: number;
    smoothing?: number;
};

export function CheAvatar({
    mood = "idle",
    size = 240,
    className,
    followCursor = false,
    followIntensity = 0.6,
    smoothing = 0.15,
}: CheAvatarProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackingDefinitionRef = useRef<AvatarDefinition | null>(null);
    if (!trackingDefinitionRef.current) {
        trackingDefinitionRef.current = createTrackingDefinition(definition);
    }
    const trackingDefinition = trackingDefinitionRef.current;

    const targetRef = useRef({ x: 0, y: 0 });
    const currentRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number | null>(null);

    const [, forceRepaint] = useReducer((n: number) => n + 1, 0);

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        targetRef.current = {
            x: Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth / 2))),
            y: Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight / 2))),
        };
    }, []);

    useEffect(() => {
        const track = trackingDefinition.expressions[CURSOR_TRACK_KEY];
        const shapeKey = TRACK_SHAPE_BY_MOOD[mood];
        const shape = (shapeKey && definition.expressions[shapeKey]) || definition.expressions.neutral;

        track.eyes.left.width = shape.eyes.left.width;
        track.eyes.left.height = shape.eyes.left.height;
        track.eyes.left.angle = shape.eyes.left.angle ?? 0;
        track.eyes.right.width = shape.eyes.right.width;
        track.eyes.right.height = shape.eyes.right.height;
        track.eyes.right.angle = shape.eyes.right.angle ?? 0;
        track.eyes.spacing = shape.eyes.spacing;

        if (followCursor) forceRepaint();
    }, [mood, followCursor, trackingDefinition, forceRepaint]);

    useEffect(() => {
        if (!followCursor) return;

        window.addEventListener("pointermove", handlePointerMove, { passive: true });

        const maxYaw = 30 * followIntensity;
        const maxPitch = 22 * followIntensity;
        const maxEyeShift = 10 * followIntensity;
        const track = trackingDefinition.expressions[CURSOR_TRACK_KEY];

        const tick = () => {
            const current = currentRef.current;
            const target = targetRef.current;

            current.x += (target.x - current.x) * smoothing;
            current.y += (target.y - current.y) * smoothing;

            track.head.x = -current.y * maxPitch;
            track.head.y = current.x * maxYaw;
            track.head.z = 0;
            track.eyes.left.x = current.x * maxEyeShift;
            track.eyes.left.y = current.y * maxEyeShift * 0.6;
            track.eyes.right.x = current.x * maxEyeShift;
            track.eyes.right.y = current.y * maxEyeShift * 0.6;

            forceRepaint();
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            currentRef.current = { x: 0, y: 0 };
            targetRef.current = { x: 0, y: 0 };
        };
    }, [followCursor, followIntensity, smoothing, handlePointerMove, trackingDefinition]);

    return (
        <div ref={containerRef} className={cn("inline-block", className)}>
            <Avatar
                definition={trackingDefinition}
                animation={followCursor ? undefined : mood}
                expression={followCursor ? CURSOR_TRACK_KEY : undefined}
                size={size}
                ariaLabel="Che, el avatar que ordena tu semana"
                className="select-none"
            />
        </div>
    );
}