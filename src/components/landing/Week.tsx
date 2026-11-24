
import { cn } from "../../lib/utils";

import type { WeekItem } from "../../lib/organize";

import { DAYS, DAY_LABEL, type AreaKey, type DayKey } from "../../lib/week";

const AREA_DOT: Record<AreaKey, string> = {
    Facultad: "bg-che-coral",
    Plata: "bg-che-ink",
    Personal: "bg-che-lav",
    Casa: "bg-che-mustard",
    Salud: "bg-che-lav-soft",
    Laburo: "bg-che-ink-soft",
    Otro: "bg-che-ink-soft",
};

const CATEGORY_PRIORITY: AreaKey[] = [
    "Facultad",
    "Plata",
    "Personal",
    "Casa",
    "Salud",
    "Laburo",
    "Otro",
];

function categoryRank(area: AreaKey) {
    const index = CATEGORY_PRIORITY.indexOf(area);
    return index === -1 ? CATEGORY_PRIORITY.length : index;
}

type WeekBoardProps = {
    items: WeekItem[];
    done: Record<string, boolean>;
    today: DayKey;
    onToggle: (key: string) => void;
    expandedDays: Set<DayKey>;
    onToggleDay: (day: DayKey) => void;
};

function itemKey(item: WeekItem, index: number) {
    return `${item.day}-${item.title}-${index}`;
}


export function WeekBoard({
    items,
    done,
    today,
    onToggle,
    expandedDays,
}: WeekBoardProps) {
    const visibleDays = DAYS.filter(
        (day) => day === today || items.some((item) => item.day === day),
    );

    if (!items.length) {
        return (
            <p className="rounded-2xl border border-dashed border-che-line px-4 py-8 text-center text-sm text-che-ink-soft">
                Todavía no armamos nada. Contale a Che qué tenés esta semana.
            </p>
        );
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleDays.map((day) => {
                const dayItems = items
                    .map((item, index) => ({
                        item,
                        index,
                        key: itemKey(item, index),
                    }))
                    .filter(({ item }) => item.day === day)
                    .sort(
                        (a, b) =>
                            categoryRank(a.item.area) - categoryRank(b.item.area) ||
                            a.index - b.index,
                    );

                const isToday = day === today;
                const isExpanded = isToday || expandedDays.has(day);
                const hasItems = dayItems.length > 0;
                const doneCount = dayItems.filter(({ key }) => done[key]).length;
                const progress = hasItems
                    ? (doneCount / dayItems.length) * 100
                    : 0;

                let lastArea: AreaKey | null = null;

                return (
                    <section
                        key={day}
                        className={cn(
                            "overflow-hidden rounded-2xl border bg-che-paper transition-all duration-200",
                            isToday
                                ? "border-che-ink/25 shadow-sm"
                                : "border-che-line",
                        )}
                    >
                        {/* HEADER */}
                        <button
                            type="button"
                           
                            disabled={isToday}
                            aria-expanded={isExpanded}
                            className={cn(
                                "flex w-full items-center gap-3 px-4 py-3 text-left !cursor-auto",
                             
                            )}
                        >
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                <h3
                                    className={cn(
                                        "text-sm font-bold tracking-tight",
                                        isToday && "text-che-ink",
                                    )}
                                >
                                    {DAY_LABEL[day]}
                                </h3>

                                {hasItems && (
                                    <span
                                        className={cn(
                                            "rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                                            doneCount === dayItems.length
                                                ? "bg-che-sage/20 text-che-ink"
                                                : "bg-che-ink/[0.07] text-che-ink-soft",
                                        )}
                                    >
                                        {doneCount}/{dayItems.length}
                                    </span>
                                )}
                            </div>

                            {isToday ? (
                                <span className="rounded-full bg-che-coral/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-che-coral">
                                    Hoy
                                </span>
                            ) : (
                                ""
                            )}
                        </button>

                        {/* PROGRESS */}
                        <div className="px-4">
                            <div className="h-px bg-che-line" />

                            {hasItems && (
                                <div className="mt-3 h-1 overflow-hidden rounded-full bg-che-ink/[0.07]">
                                    <div
                                        className="h-full rounded-full bg-che-sage transition-[width] duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* CONTENT */}
                        <div
                            className={cn(
                                "grid transition-[grid-template-rows] duration-300 ease-out",
                                isExpanded
                                    ? "grid-rows-[1fr]"
                                    : "grid-rows-[0fr]",
                            )}
                        >
                            <div className="overflow-hidden">
                                <div className="px-4 pb-4 pt-3">
                                    {!hasItems ? (
                                        <p className="py-2 text-xs text-che-ink-soft">
                                            Día libre
                                        </p>
                                    ) : (
                                        <div
                                            className={cn(
                                                "space-y-3 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                                                dayItems.length <= 2 && "overflow-y-visible",
                                            )}
                                            style={
                                                dayItems.length > 2
                                                    ? { maxHeight: "142px" }
                                                    : undefined
                                            }
                                        >
                                            {dayItems.map(({ item, key }) => {
                                                const isDone = Boolean(done[key]);
                                                const isNewCategory =
                                                    item.area !== lastArea;

                                                lastArea = item.area;

                                                return (
                                                    <div key={key}>
                                                        {/* CATEGORY */}
                                                        {isNewCategory && (
                                                            <div className="mb-1.5 flex items-center gap-1.5">
                                                                <span
                                                                    className={cn(
                                                                        "size-1.5 rounded-full",
                                                                        AREA_DOT[item.area],
                                                                    )}
                                                                />

                                                                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-che-ink-soft">
                                                                    {item.area}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* TASK */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onToggle(key)
                                                            }
                                                            aria-pressed={isDone}
                                                            className={cn(
                                                                "group flex w-full items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 text-left transition-all duration-150",
                                                                "hover:border-che-line hover:bg-che-bg",
                                                                "active:scale-[0.985]",
                                                                isDone &&
                                                                "opacity-55",
                                                            )}
                                                        >
                                                            <span
                                                                className={cn(
                                                                    "flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-all duration-150",
                                                                    isDone
                                                                        ? "border-che-sage bg-che-sage"
                                                                        : "border-che-ink/20 bg-transparent group-hover:border-che-ink/40",
                                                                )}
                                                            >
                                                                {/* {isDone && (
                                                                    <CheckIcon
                                                                        className="size-2.5 text-che-ink"
                                                                       
                                                                    />
                                                                )} */}
                                                            </span>

                                                            <span className="min-w-0 flex-1">
                                                                <span
                                                                    className={cn(
                                                                        "block truncate text-[13px] font-semibold leading-snug",
                                                                        isDone &&
                                                                        "text-che-ink-soft line-through decoration-che-coral decoration-2",
                                                                    )}
                                                                >
                                                                    {item.title}
                                                                </span>

                                                                <span className="mt-0.5 block text-[10px] font-medium text-che-ink-soft">
                                                                    {item.when}
                                                                </span>
                                                            </span>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

export function WeekAdditions({ items }: { items: WeekItem[] }) {
    if (!items.length) return null;

    const sorted = [...items].sort(
        (a, b) => categoryRank(a.area) - categoryRank(b.area),
    );

    return (
        <ul className="flex flex-col gap-2">
            {sorted.map((item, index) => (
                <li
                    key={`${item.day}-${item.title}-${index}`}
                    className="flex items-start gap-2 text-sm leading-snug"
                >
                    <span
                        className={cn(
                            "mt-1.5 size-1.5 shrink-0 rounded-full",
                            AREA_DOT[item.area],
                        )}
                        aria-hidden="true"
                    />

                    <span>
                        <span className="font-semibold">{item.title}</span>
                        <span className="text-che-ink-soft">
                            {" "}
                            — {item.when} · {item.area}
                        </span>
                    </span>
                </li>
            ))}
        </ul>
    );
}

export function morningPing(
    items: WeekItem[],
    today: DayKey,
): string {
    const todayItems = items
        .filter((item) => item.day === today)
        .sort(
            (a, b) =>
                categoryRank(a.area) - categoryRank(b.area),
        );

    if (!todayItems.length) {
        return "Hoy no hay nada marcado. Si se te aparece algo, mandamelo.";
    }

    const bits = todayItems
        .slice(0, 3)
        .map((item) => `${item.title} (${item.when})`)
        .join(". ");

    return `Hoy: ${bits}.`;
}
