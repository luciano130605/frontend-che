import { z } from "zod";
import {
    AREAS,
    DAYS,
    weekdayInArgentina,
    type AreaKey,
    type DayKey,
} from "./week";

export const ItemSchema = z.object({
    title: z.string().min(1).max(80),
    day: z.enum(DAYS),
    when: z.string().min(1).max(40),
    area: z.enum(AREAS),
});

export const OrganizeResultSchema = z.object({
    reply: z.string().min(1).max(280),
    mood: z.enum(["happy", "confused", "proud", "curious", "celebrate"]),
    items: z.array(ItemSchema).min(1).max(12),
});

export type WeekItem = z.infer<typeof ItemSchema>;
export type OrganizeResult = z.infer<typeof OrganizeResultSchema>;

export type OrganizeResponse =
    | ({ ok: true } & OrganizeResult)
    | { ok: false; error: string };

const InputSchema = z.object({
    text: z.string().trim().min(3).max(800),
});

const DAY_PATTERNS: Array<[RegExp, DayKey]> = [
    [/lunes/i, "lunes"],
    [/martes/i, "martes"],
    [/mi[eé]rcoles/i, "miercoles"],
    [/jueves/i, "jueves"],
    [/viernes/i, "viernes"],
    [/s[aá]bados?/i, "sabado"],
    [/domingos?/i, "domingo"],
];

function shiftDay(from: DayKey, delta: number): DayKey {
    const i = DAYS.indexOf(from);
    return DAYS[(i + delta + 7) % 7]!;
}

function detectDay(chunk: string, today: DayKey): DayKey | null {
    if (/\bhoy\b/i.test(chunk)) return today;
    if (/\bpasado\s+ma[nñ]ana\b/i.test(chunk)) return shiftDay(today, 2);
    if (/\bma[nñ]ana\b/i.test(chunk)) return shiftDay(today, 1);
    for (const [re, day] of DAY_PATTERNS) {
        if (re.test(chunk)) return day;
    }
    return null;
}

function detectArea(chunk: string): AreaKey {
    const t = chunk.toLowerCase();
    if (/tp|facu|parcial|profe|materia|universidad|libro/.test(t)) return "Facultad";
    if (/alquiler|pagar|plata|cv|sueldo|transfer/.test(t)) return "Plata";
    if (/gym|dentista|turno|m[eé]dic|salud/.test(t)) return "Salud";
    if (/laburo|trabajo|reuni[oó]n|oficina|jefe/.test(t)) return "Laburo";
    if (/casa|limpiar|comprar|super/.test(t)) return "Casa";
    if (/cumple|mam[aá]|pap[aá]|regalo|sofi|amigo/.test(t)) return "Personal";
    return "Otro";
}

function detectWhen(chunk: string): string {
    const hour = chunk.match(/\b(\d{1,2})\s*(?:hs|h|:00|am|pm)\b/i);
    if (hour) {
        const n = Number(hour[1]);
        if (n >= 1 && n <= 23) return `${n}:00`;
    }
    if (/ma[nñ]ana|8am|desayuno/.test(chunk.toLowerCase())) return "a la mañana";
    if (/tarde|16hs/.test(chunk.toLowerCase())) return "a la tarde";
    if (/noche/.test(chunk.toLowerCase())) return "a la noche";
    return "durante el día";
}

function cleanTitle(chunk: string): string {
    return chunk
        .replace(
            /\b(el|la|los|las|un|una|este|esta|hoy|mañana|manana|pasado)\b/gi,
            " ",
        )
        .replace(
            /\b(lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\b/gi,
            " ",
        )
        .replace(/\b\d{1,2}\s*(?:hs|h|:00|am|pm)\b/gi, " ")
        .replace(/^[,\.\-\s]+|[,\.\-\s]+$/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}

export function fallbackOrganize(text: string, today = weekdayInArgentina()): OrganizeResult {
    const parts = text
        .split(/\n+|(?<=\D)[,;.](?=\s)|(?:\s+y\s+)|(?:\s+e\s+)/i)
        .map((p) => p.trim())
        .filter((p) => p.length > 2);

    const chunks = parts.length ? parts : [text.trim()];
    const items: WeekItem[] = [];
    let lastDay: DayKey | null = null;

    for (const chunk of chunks) {
        const day = detectDay(chunk, today) ?? lastDay ?? shiftDay(today, 1);
        lastDay = detectDay(chunk, today) ?? lastDay;
        const title = cleanTitle(chunk) || chunk.slice(0, 60);
        if (!title) continue;
        items.push({
            title: title.charAt(0).toUpperCase() + title.slice(1),
            day,
            when: detectWhen(chunk),
            area: detectArea(chunk),
        });
        if (items.length >= 8) break;
    }

    if (!items.length) {
        items.push({
            title: text.slice(0, 60),
            day: shiftDay(today, 1),
            when: "durante el día",
            area: "Otro",
        });
    }

    return {
        reply: "Listo. Te armé el tablero con lo que me contaste.",
        mood: "proud",
        items,
    };
}

/**
 * Versión "demo": corre 100% en el navegador, sin server function ni
 * TanStack Start de por medio. Mantiene la misma firma ({ data: { text } })
 * que antes para no tener que tocar quien la llama.
 */
export async function organizeWeek({
    data,
}: {
    data: { text: string };
}): Promise<OrganizeResponse> {
    const parsed = InputSchema.safeParse(data);
    if (!parsed.success) {
        return { ok: false, error: "Contame un poco más de tu semana." };
    }
    const today = weekdayInArgentina();
    const result = fallbackOrganize(parsed.data.text, today);
    return { ok: true, ...result };
}