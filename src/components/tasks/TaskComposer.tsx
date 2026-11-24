import { useRef, useState } from 'react';
import { parseTasks, errorMessage, type Task } from '../../lib/api';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mic01Icon } from '@hugeicons/core-free-icons';
import UnparsedInbox from './UnparsedInbox';

const QUICK_EXAMPLES = [
  'pagar el abl antes del 30',
  'devolverle el libro a Flor',
  'reunión Che todos los viernes 19pm',
];

// El borrador sobrevive a un error, a un cambio de pantalla o a un F5.
// sessionStorage, igual que la sesión: no queda texto de un usuario para el siguiente.
const DRAFT_KEY = 'che.composer.draft';

function readDraft(): string {
  try {
    return sessionStorage.getItem(DRAFT_KEY) ?? '';
  } catch {
    return '';
  }
}

function writeDraft(value: string) {
  try {
    if (value) sessionStorage.setItem(DRAFT_KEY, value);
    else sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // sin storage no hay borrador, pero el texto sigue en pantalla
  }
}

interface TaskComposerProps {
  onTasksCreated: (tasks: Task[]) => void;
}



export default function TaskComposer({ onTasksCreated }: TaskComposerProps) {
  const [text, setText] = useState(readDraft);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(0);
  // Si la IA no entiende un texto, queda en "Sin interpretar": esto refresca esa bandeja.
  const [unparsedRefresh, setUnparsedRefresh] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Lo que ya había escrito antes de dictar: el dictado se agrega al final.
  const dictationBase = useRef('');

  function updateText(value: string) {
    setText(value);
    writeDraft(value);
  }

  const { supported, listening, error: micError, start, stop } = useSpeechRecognition({
    lang: 'es-AR',
    onTranscript: (transcript) => {
      const base = dictationBase.current;
      const separator = base && !/\s$/.test(base) ? ' ' : '';
      updateText(`${base}${separator}${transcript}`);
    },
  });

  function toggleMic() {
    if (listening) return stop();
    dictationBase.current = text;
    setError(null);
    start();
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    stop();
    setLoading(true);
    setError(null);
    setSaved(0);
    try {
      const tasks = await parseTasks(trimmed);
      onTasksCreated(tasks);
      setSaved(tasks.length);
      updateText(''); // recién ahora, con la respuesta en mano
    } catch (err) {
      // el texto queda como estaba para poder reintentar sin volver a escribir
      setError(`${errorMessage(err, 'No se pudo conectar con el servidor.')} Tu texto sigue acá, podés reintentar.`);
      setUnparsedRefresh((value) => value + 1);
    } finally {
      setLoading(false);
    }
  }

  function applyExample(example: string) {
    stop();
    updateText(example);
    textareaRef.current?.focus();
  }

  return (
    <div className="rounded-[1.5rem] border border-che-line bg-che-paper p-4 shadow-[0_10px_24px_rgba(32,35,34,.08)] md:sticky md:top-[90px] md:rounded-[18px] md:border-2 md:border-che-ink md:p-5 md:shadow-che-lg md:shadow-che-lav-soft">
      <h3 className="mb-1 font-display text-lg font-semibold">Contame qué tenés</h3>
      <div className="mb-4 text-sm text-che-ink-soft">
        {supported ? 'Escribí o dictá, como si le hablaras a alguien' : 'Escribí como si le hablaras a alguien'}
      </div>

      <textarea
        ref={textareaRef}
        className={`min-h-[104px] w-full resize-none rounded-[14px] border bg-che-bg p-3.5 font-sans text-base text-che-ink transition-colors focus:border-che-coral focus:outline-none md:min-h-[92px] md:rounded-[11px] md:border-[1.5px] md:text-sm ${error ? 'border-che-coral' : 'border-che-line'
          }`}
        placeholder="Ej: tengo que llamar al dentista, entregar el informe el lunes..."
        value={text}
        onChange={(e) => {
          if (listening) stop(); // si se pone a escribir, el teclado manda
          updateText(e.target.value);
        }}
        disabled={loading}
      />

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="font-hand text-base text-che-ink-soft">
          {listening ? 'te escucho…' : 'la IA lo ordena sola'}
        </span>
        <div className="flex items-center gap-2">
          {supported && (
            <button
              type="button"
              aria-label={listening ? 'Dejar de dictar' : 'Dictar por micrófono'}
              aria-pressed={listening}
              title={listening ? 'Dejar de dictar' : 'Dictar por micrófono'}
              className={`       inline-flex items-center rounded-xl
                                        border border-che-line bg-che-paper
                                        font-semibold text-che-ink
                                        transition-all duration-300 ease-out
                                        hover:-translate-y-0.5 hover:border-che-ink
                                        hover:shadow-che-sm hover:shadow-che-ink
                                        active:translate-y-0 active:shadow-none p-3 ${listening ? 'animate-pulse bg-che-coral text-che-ink' : 'bg-che-paper text-che-ink hover:bg-che-coral-soft'
                }`}
              onClick={toggleMic}
              disabled={loading}
            >
              <HugeiconsIcon icon={Mic01Icon} size={15} />
            </button>
          )}
          <button
            className="      group relative inline-flex items-center gap-1.5
                                        overflow-hidden rounded-xl border border-che-ink bg-che-ink
                                        font-semibold text-che-bg
                                        transition-all duration-300 ease-out
                                        hover:-translate-y-0.5 hover:bg-che-coral-dark
                                        hover:border-che-coral-dark
                                        hover:shadow-che-sm hover:shadow-che-ink
                                        active:translate-y-0 active:shadow-none
                                        p-3 
            
            disabled:opacity-60"
            onClick={handleSend}
            disabled={loading || !text.trim()}
          >


            <span className="relative z-10">{loading ? 'Pensando...' : error ? 'Reintentar' : 'Agregar'}</span>
            <span
              aria-hidden
              className="
                                            absolute inset-0 -translate-x-full bg-che-coral
                                            transition-transform duration-300 ease-out
                                            group-hover:translate-x-0
                                        "
            />
          </button>
        </div>
      </div>

      {micError && <p className="mt-3 text-sm font-medium text-che-coral-dark">{micError}</p>}

      {error ? <p className="mt-3 text-sm font-medium text-che-coral-dark">{error}</p> : null}

      {!error && saved > 0 ? (
        <p className="mt-3 text-sm font-medium text-che-ink-soft">
          {saved === 1 ? 'Tarea agregada ✓' : `${saved} tareas agregadas ✓`}
        </p>
      ) : null}

      <UnparsedInbox refreshKey={unparsedRefresh} onTasksCreated={onTasksCreated} />

      <div className="mt-4 border-t-[1.5px] border-dashed border-che-line pt-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-che-ink-soft">
          Ejemplos rápidos
        </div>
        {QUICK_EXAMPLES.map((example) => (
          <button
            key={example}
            className="mb-1.5 block w-full rounded-[9px] border-[1.5px] border-che-line bg-che-bg px-2.5 py-2 text-left text-sm text-che-ink-soft transition-colors hover:border-che-coral hover:bg-che-coral-soft hover:text-che-ink"
            onClick={() => applyExample(example)}
            disabled={loading}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
