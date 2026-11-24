import { useEffect, useMemo, useRef, useState } from "react";
import { CheAvatar, type CheMood } from "../avatar/avatar";
import { WeekBoard, WeekAdditions, morningPing } from "./Week";
import { organizeWeek, type OrganizeResult, type WeekItem } from "../../lib/organize";
import { DAYS, weekdayInArgentina, type DayKey } from "../../lib/week";
import { cn } from "../../lib/utils";

const EXAMPLES = [
  "Entregar el TP el martes, pagar el alquiler el viernes y el cumple de mamá el sábado",
  "Mañana gym a las 8, dentista el jueves 16hs y devolver el libro de la facu",
  "Reunión con el profe el miércoles y mandar el CV antes del viernes",
];

const MIN_THINKING_MS = 900;
const TEXTAREA_MAX_HEIGHT = 128; 

const LISTENING_MOOD = "listening" as CheMood;

type ChatMessage =
  | { id: string; role: "che"; kind: "text"; text: string }
  | { id: string; role: "che"; kind: "typing" }
  | { id: string; role: "user"; kind: "text"; text: string }
  | { id: string; role: "che"; kind: "additions"; items: WeekItem[] };

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function Demo() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "intro", role: "che", kind: "text", text: "Contame qué tenés esta semana, como si me lo dijeras al pasar." },
  ]);
  const [items, setItems] = useState<WeekItem[]>([]);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [mood, setMood] = useState<CheMood>("idle");
  const today = useMemo(() => weekdayInArgentina(), []);
  const [expandedDays, setExpandedDays] = useState<Set<DayKey>>(() => new Set(DAYS));
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const moodTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const baseTextRef = useRef("");

  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor();
    setSpeechSupported(Boolean(Ctor));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (moodTimeout.current) clearTimeout(moodTimeout.current);
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
  }, [text]);

  function flashMood(next: CheMood, holdMs = 1600) {
    if (moodTimeout.current) clearTimeout(moodTimeout.current);
    setMood(next);
    moodTimeout.current = setTimeout(() => setMood("idle"), holdMs);
  }

  function toggleRecording() {
    if (loading) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "es-AR";

    baseTextRef.current = text.trim().length ? `${text.trim()} ` : "";

    recognition.onresult = (event: any) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalChunk += result[0].transcript;
        } else {
          interimChunk += result[0].transcript;
        }
      }
      if (finalChunk) {
        baseTextRef.current = `${baseTextRef.current}${finalChunk} `;
      }
      setText(`${baseTextRef.current}${interimChunk}`);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setMood("idle");
    };

    recognition.onend = () => {
      setIsRecording(false);
      setMood("idle");
      inputRef.current?.focus();
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setMood(LISTENING_MOOD);
  }

  async function send(source = text) {
    const value = source.trim();
    if (value.length < 3 || loading) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    }

    setText("");
    setLoading(true);
    setMood("waking");
    setMessages((current) => [
      ...current,
      { id: uid(), role: "user", kind: "text", text: value },
      { id: "typing", role: "che", kind: "typing" },
    ]);

    const start = Date.now();
    try {
      const response = await organizeWeek({ data: { text: value } });
      const elapsed = Date.now() - start;
      if (elapsed < MIN_THINKING_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_THINKING_MS - elapsed));
      }

      setMessages((current) => current.filter((message) => message.id !== "typing"));

      if (!response.ok) {
        setMessages((current) => [
          ...current,
          { id: uid(), role: "che", kind: "text", text: "Che se trabó un segundo. Probá de nuevo." },
        ]);
        setMood("idle");
        return;
      }

      const { reply, mood: resultMood, items: newItems } = response as OrganizeResult;
      setItems((current) => [...current, ...newItems]);
      setExpandedDays((current) => {
        const next = new Set(current);
        newItems.forEach((item) => next.add(item.day));
        return next;
      });
      setMessages((current) => [
        ...current,
        { id: uid(), role: "che", kind: "text", text: reply },
        { id: uid(), role: "che", kind: "additions", items: newItems },
      ]);
      flashMood(resultMood ?? "proud");
    } catch {
      setMessages((current) => [
        ...current.filter((message) => message.id !== "typing"),
        { id: uid(), role: "che", kind: "text", text: "Che se trabó un segundo. Probá de nuevo." },
      ]);
      setMood("idle");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function reset() {
    setMessages([
      { id: "intro", role: "che", kind: "text", text: "Contame qué tenés esta semana, como si me lo dijeras al pasar." },
    ]);
    setItems([]);
    setDone({});
    setText("");
    setMood("idle");
    setExpandedDays(new Set(DAYS));
  }

  function handleToggle(key: string) {
    setDone((current) => ({ ...current, [key]: !current[key] }));
  }

  function handleToggleDay(day: DayKey) {
    setExpandedDays((current) => {
      const next = new Set(current);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  }

  const hasStarted = messages.some((message) => message.role === "user");
  const ping = items.length ? morningPing(items, today) : null;
  const avatarMood = loading
    ? "waking"
    : isRecording
      ? LISTENING_MOOD
      : text.trim().length > 0
        ? "searching"
        : mood;

  return (
    <section id="demo" className="mx-auto max-w-237.5 px-4 py-12 sm:px-7 sm:py-16 lg:max-w-295">
      <div className="mb-8 max-w-xl">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl md:text-[2.4rem]">
          Escribilo como se lo dirías a un amigo.
        </h2>
        <p className="mt-3 text-base leading-relaxed text-che-ink-soft sm:text-lg">
          Sin cuenta, sin calendario, sin elegir prioridad. Se lo contás a Che
          y él te arma la semana a medida que hablan.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
        <div className="overflow-hidden rounded-3xl border border-che-ink/15 bg-che-paper shadow-che sm:rounded-[28px]">
          <header className="flex items-center gap-3 border-b border-che-line px-4 py-3 sm:px-6">
            <CheAvatar mood={avatarMood} size={40} />
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold leading-tight">
                Che<span className="font-medium italic text-che-coral">.</span>
              </p>
              <p className="truncate text-xs text-che-ink-soft">
                {loading ? "escribiendo…" : isRecording ? "te escucho…" : "te organiza mientras hablan"}
              </p>
            </div>
            {hasStarted ? (
              <button
                type="button"
                onClick={reset}
                className="ml-auto flex min-h-9 shrink-0 items-center rounded-full border border-che-line px-3 py-1.5 text-xs font-semibold text-che-ink-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-che-ink hover:shadow-che-sm hover:shadow-che-ink active:scale-95"
              >
                Empezar de nuevo
              </button>
            ) : null}
          </header>

          <div className="relative">
            <div
              ref={scrollRef}
              role="log"
              aria-live="polite"
              aria-label="Conversación con Che"
              className="hide-scrollbar flex max-h-[55vh] flex-col gap-3 overflow-y-auto px-4 py-5 sm:max-h-110 sm:px-6"
            >
              {messages.map((message) => {
                if (message.kind === "typing") {
                  return (
                    <div
                      key={message.id}
                      className="flex items-center gap-1.5 self-start rounded-2xl rounded-bl-sm bg-che-bg px-4 py-3"
                    >
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-che-ink/40"
                          style={{ animationDelay: `${dot * 150}ms` }}
                        />
                      ))}
                    </div>
                  );
                }

                if (message.role === "user") {
                  return (
                    <p
                      key={message.id}
                      className="max-w-[88%] self-end rounded-2xl rounded-br-sm bg-che-ink px-4 py-2.5 text-sm leading-relaxed text-che-bg sm:max-w-[85%]"
                    >
                      {message.text}
                    </p>
                  );
                }

                if (message.kind === "additions") {
                  if (!message.items.length) return null;
                  return (
                    <div
                      key={message.id}
                      className="max-w-[88%] self-start rounded-2xl rounded-bl-sm border border-che-line bg-che-sage-soft px-4 py-3 sm:max-w-[85%]"
                    >
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-che-sage">
                        Sumado a tu semana
                      </p>
                      <WeekAdditions items={message.items} />
                    </div>
                  );
                }

                return (
                  <p
                    key={message.id}
                    className="max-w-[88%] self-start rounded-2xl rounded-bl-sm bg-che-bg px-4 py-2.5 text-sm leading-relaxed text-che-ink sm:max-w-[85%]"
                  >
                    {message.text}
                  </p>
                );
              })}
            </div>

            {/* Fades sutiles para insinuar que hay más contenido arriba/abajo */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-linear-to-b from-che-paper to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-che-paper to-transparent"
            />
          </div>

          <div className="border-t border-che-line p-4 sm:p-5">
            {!hasStarted ? (
              <div className="mb-3 flex flex-wrap gap-2">
                {EXAMPLES.map((example) => (
                  <button
                    key={example}
                    title={example}
                    type="button"
                    disabled={loading}
                    onClick={() => void send(example)}
                    className="group w-fit max-w-full rounded-full border border-che-line bg-che-bg px-3 py-2 text-left text-xs font-medium text-che-ink-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-che-ink hover:shadow-che-sm hover:shadow-che-ink active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <span className="block max-w-65 truncate group-hover:max-w-125">
                      {example}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void send();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={inputRef}
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
                rows={1}
                maxLength={800}
                disabled={loading}
                placeholder={isRecording ? "te escucho…" : "che, acordate del cumple de mamá el sábado…"}
                className="hide-scrollbar min-h-12 max-h-32 flex-1 resize-none rounded-2xl border border-che-line bg-che-bg px-4 py-3 text-sm leading-relaxed text-che-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-che-ink-soft/70 focus:border-che-ink focus:shadow-che disabled:opacity-60 sm:min-h-11 sm:py-2.5"
              />

              {speechSupported ? (
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={loading}
                  aria-label={isRecording ? "Detener grabación" : "Hablar"}
                  aria-pressed={isRecording}
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ease-out active:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 sm:size-11",
                    isRecording
                      ? "animate-pulse border-che-coral bg-che-coral text-che-bg"
                      : "border-che-line bg-che-bg text-che-ink-soft transition-all duration-200 ease-out hover:border-che-ink hover:shadow-che-sm hover:shadow-che-ink",
                  )}
                >
                  {/* {isRecording ? <MicroSlash className="size-5" /> : <Micro className="size-5" />} */}
                </button>
              ) : null}

              <button
                type="submit"
                disabled={loading || text.trim().length < 3}
                aria-label="Enviar"
                className="group relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-che-ink text-che-bg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-che-coral-dark hover:shadow-che-sm hover:shadow-che-ink active:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 sm:size-11"
              >
                {/* <Send className="relative z-10 size-5" /> */}
                <span className="absolute inset-0 -translate-x-full bg-che-coral transition-transform duration-300 ease-out group-hover:translate-x-0" />
              </button>
            </form>
            <p className="mt-2 text-xs text-che-ink-soft">No se guarda nada. Es una demo.</p>
          </div>
        </div>

        {items.length ? (
          <div className="mt-6 overflow-hidden rounded-3xl border border-che-ink/15 bg-che-paper shadow-che sm:rounded-[28px] lg:sticky lg:top-6 lg:mt-0">
            <div className="flex items-center justify-between gap-2 border-b border-che-line px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <h3 className="font-display text-sm font-semibold tracking-tight">Tu semana</h3>
                {ping ? <p className="truncate text-xs text-che-ink-soft">{ping}</p> : null}
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <WeekBoard
                items={items}
                done={done}
                today={today}
                onToggle={handleToggle}
                expandedDays={expandedDays}
                onToggleDay={handleToggleDay}
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
