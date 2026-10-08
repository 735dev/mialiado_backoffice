import { Lock, Paperclip } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { MensajeTicket } from '../models/ticket';
import { formatDateTime } from '@/lib/utils/format';
import { Avatar } from '@/components/ui/Avatar';

/** Solo se enlazan adjuntos http(s); cualquier otro texto se muestra como nombre de archivo. */
function esUrlSegura(valor: string): boolean {
  try {
    const u = new URL(valor);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

function Adjunto({ valor }: { valor: string }) {
  const contenido = (
    <>
      <Paperclip size={14} aria-hidden="true" />
      <span className="truncate">{valor}</span>
    </>
  );
  const clases = 'mt-2 inline-flex h-9 max-w-full items-center gap-2 rounded-pill bg-surface-2 px-3.5 text-xs font-semibold text-ink-soft';
  return esUrlSegura(valor) ? (
    <a href={valor} target="_blank" rel="noopener noreferrer" className={cn(clases, 'hover:text-primary-deep')}>
      {contenido}
    </a>
  ) : (
    <span className={clases}>{contenido}</span>
  );
}

/** Conversacion del ticket: mensajes de la persona, respuestas del equipo, notas internas y avisos del sistema. */
export function HiloMensajes({ mensajes }: { mensajes: MensajeTicket[] }) {
  const t = useT();
  const { lang } = useLang();
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fin.current?.scrollIntoView?.({ block: 'end' });
  }, [mensajes.length]);

  return (
    <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-4 py-5 md:px-7" role="log" aria-label={t('soporte.thread.aria')}>
      {mensajes.map((m) => {
        if (m.tipo === 'sistema') {
          return (
            <div key={m.id} className="flex items-center gap-3 text-xs font-medium text-ink-muted">
              <span className="h-px flex-1 bg-line" />
              <span className="text-center">
                {m.cuerpo} · {formatDateTime(m.created_at, lang)}
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>
          );
        }
        if (m.tipo === 'nota') {
          return (
            <div key={m.id} className="max-w-[620px] self-end rounded-[20px] bg-warn-tint px-[18px] py-3.5 text-warn md:ml-[52px]">
              <div className="mb-1 flex items-center gap-2 text-xs font-bold">
                <Lock size={13} aria-hidden="true" />
                {t('soporte.thread.note', { autor: m.autor, hora: formatDateTime(m.created_at, lang) })}
              </div>
              <p className="whitespace-pre-wrap break-words text-[15px] leading-6 text-ink">{m.cuerpo}</p>
            </div>
          );
        }
        return (
          <div key={m.id} className={cn('flex max-w-[680px] items-start gap-3', !m.es_solicitante && 'flex-row-reverse self-end')}>
            <Avatar name={m.autor} />
            <div className="min-w-0">
              <div className={cn('mb-1.5 flex items-baseline gap-2', !m.es_solicitante && 'flex-row-reverse')}>
                <span className="text-sm font-bold">{m.autor}</span>
                <span className="text-xs text-ink-muted">{formatDateTime(m.created_at, lang)}</span>
              </div>
              <p
                className={cn(
                  'whitespace-pre-wrap break-words rounded-[20px] px-[18px] py-3.5 text-[15px] leading-6',
                  m.es_solicitante ? 'bg-bg text-ink' : 'bg-primary-tint text-ink',
                )}
              >
                {m.cuerpo}
              </p>
              {m.adjunto && <Adjunto valor={m.adjunto} />}
            </div>
          </div>
        );
      })}
      <div ref={fin} />
    </div>
  );
}
