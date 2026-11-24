import { useCallback, useEffect, useRef, useState } from 'react';

// La API de dictado del navegador (Web Speech API) no está en los tipos de TypeScript de todas
// las versiones, así que declaramos solo lo que usamos.
interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResult {
  isFinal: boolean;
  0: RecognitionAlternative;
}
interface RecognitionEvent {
  results: ArrayLike<RecognitionResult>;
}
interface RecognitionErrorEvent {
  error: string;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type RecognitionConstructor = new () => Recognition;

function getConstructor(): RecognitionConstructor | null {
  if (typeof window === 'undefined' || !window.isSecureContext) return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'No tenemos permiso para usar el micrófono. Habilitalo desde el candado de la barra de direcciones.',
  'service-not-allowed': 'No tenemos permiso para usar el micrófono. Habilitalo desde el candado de la barra de direcciones.',
  'no-speech': 'No te escuché. Probá de nuevo.',
  'audio-capture': 'No encontramos un micrófono conectado.',
  network:
    'Tu navegador no pudo transcribir el audio. Pasa en Brave y en navegadores sin servicio de voz; probá en Chrome o Edge.',
};

interface Options {
  lang?: string;
  /** Recibe lo dictado en esta sesión completo (final + lo que todavía se está procesando). */
  onTranscript: (transcript: string) => void;
}

export function useSpeechRecognition({ lang = 'es-AR', onTranscript }: Options) {
  const [supported] = useState(() => getConstructor() !== null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  });

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getConstructor();
    if (!Ctor || recognitionRef.current) return;

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      onTranscriptRef.current(transcript.trim());
    };
    recognition.onerror = (event) => {
      if (event.error === 'aborted') return;
      setError(ERROR_MESSAGES[event.error] ?? 'No pudimos usar el micrófono. Probá de nuevo.');
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };

    setError(null);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      recognitionRef.current = null;
      setError('No pudimos iniciar el micrófono. Probá de nuevo.');
    }
  }, [lang]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { supported, listening, error, start, stop };
}
