export const DAYS = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
] as const;

export type DayKey = (typeof DAYS)[number];

export const DAY_LABEL: Record<DayKey, string> = {
    lunes: "Lun",
    martes: "Mar",
    miercoles: "Mié",
    jueves: "Jue",
    viernes: "Vie",
    sabado: "Sáb",
    domingo: "Dom",
};

export const DAY_FULL: Record<DayKey, string> = {
    lunes: "Lunes",
    martes: "Martes",
    miercoles: "Miércoles",
    jueves: "Jueves",
    viernes: "Viernes",
    sabado: "Sábado",
    domingo: "Domingo",
};

export const AREAS = [
    "Facultad",
    "Plata",
    "Personal",
    "Casa",
    "Salud",
    "Laburo",
    "Otro",
] as const;

export type AreaKey = (typeof AREAS)[number];

export function weekdayInArgentina(date = new Date()): DayKey {
    const name = new Intl.DateTimeFormat("es-AR", {
        weekday: "long",
        timeZone: "America/Argentina/Buenos_Aires",
    }).format(date);
    const key = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") as DayKey;
    return DAYS.includes(key) ? key : "lunes";
}

export function formatLongDate(date = new Date()): string {
    return new Intl.DateTimeFormat("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "America/Argentina/Buenos_Aires",
    }).format(date);
}