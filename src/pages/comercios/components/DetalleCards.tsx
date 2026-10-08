import { CheckCircle2, CircleDashed, ExternalLink, FileText, ImageIcon, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { useT } from '@/lib/hooks/useT';
import type { Lang } from '@/lib/i18n';
import { cn } from '@/lib/utils/cn';
import type { ComercioDetalle, DocumentoComercio } from '@/providers/comerciosProvider';
import { osmEmbedUrl, osmLink, resumenHorario } from '../utils/format';
import { formatDateTime } from '@/lib/utils/format';

export function Panel({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-card bg-surface p-5 shadow-e1 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[19px] font-extrabold leading-6 tracking-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Dato({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-xs uppercase tracking-wider text-ink-muted">{label}</dt>
      <dd className={cn('mt-1 break-words text-sm font-semibold', mono && 'font-mono')}>{value || '–'}</dd>
    </div>
  );
}

export function DatosCard({ c }: { c: ComercioDetalle }) {
  const t = useT();
  const horario = resumenHorario(c.horario ?? []);
  return (
    <Panel title={t('comercios.detalle.datos')} subtitle={t('comercios.detalle.datosSub')}>
      <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
        <Dato label={t('comercios.detalle.rif')} value={c.rif} mono />
        <Dato label={t('comercios.detalle.razonSocial')} value={c.razon_social} />
        <Dato label={t('comercios.detalle.nombreComercial')} value={c.nombre} />
        <Dato label={t('comercios.detalle.categoria')} value={c.categoria} />
        <Dato label={t('comercios.detalle.direccion')} value={[c.direccion, c.ciudad].filter(Boolean).join(', ')} />
        <Dato label={t('comercios.detalle.horario')} value={horario} />
        <Dato label={t('comercios.detalle.contacto')} value={c.dueno ? `${c.dueno.nombre} · ${c.dueno.rol}` : null} />
        <Dato label={t('comercios.detalle.whatsapp')} value={c.whatsapp ?? c.dueno?.telefono} />
        <Dato label={t('comercios.detalle.correo')} value={c.correo_contacto ?? c.dueno?.correo} />
        <Dato label={t('comercios.detalle.instagram')} value={c.instagram} />
      </dl>
    </Panel>
  );
}

const TIPO_ICON = { rif: FileText, registro: FileText, fachada: ImageIcon } as const;

interface DocsProps {
  documentos: DocumentoComercio[];
  puedeEditar: boolean;
  busy: boolean;
  onToggle: (d: DocumentoComercio) => void;
}

export function DocumentosCard({ documentos, puedeEditar, busy, onToggle }: DocsProps) {
  const t = useT();
  return (
    <Panel title={t('comercios.detalle.documentos')} subtitle={t('comercios.detalle.documentosSub', { n: documentos.length })}>
      {documentos.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">{t('comercios.detalle.sinDocumentos')}</p>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {documentos.map((d) => {
            const Icon = TIPO_ICON[d.tipo as keyof typeof TIPO_ICON] ?? FileText;
            const tipo = t(`comercios.doc.${d.tipo}`);
            return (
              <li key={d.id} className="flex flex-col gap-3 rounded-field bg-bg p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-surface-2 text-ink-soft">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{tipo}</p>
                    <p className="truncate font-mono text-xs uppercase text-ink-muted">{d.nombre ?? d.tipo}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={d.revisado ? 'ok' : 'warn'}>{d.revisado ? t('comercios.detalle.revisado') : t('comercios.detalle.pendiente')}</Badge>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t('comercios.detalle.abrirDoc', { tipo })}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:bg-surface-2"
                  >
                    <ExternalLink size={18} aria-hidden="true" />
                  </a>
                </div>
                <button
                  type="button"
                  disabled={!puedeEditar || busy}
                  title={puedeEditar ? undefined : t('comercios.sinPermisoEditar')}
                  onClick={() => onToggle(d)}
                  aria-label={d.revisado ? t('comercios.detalle.quitarRevisado', { tipo }) : t('comercios.detalle.marcarRevisado', { tipo })}
                  className="h-11 rounded-pill bg-surface text-sm font-bold text-ink ring-1 ring-inset ring-line-strong disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {d.revisado ? t('comercios.detalle.quitarCorto') : t('comercios.detalle.marcarCorto')}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

export function UbicacionCard({ c, confirmada }: { c: ComercioDetalle; confirmada: boolean }) {
  const t = useT();
  const hasCoords = typeof c.lat === 'number' && typeof c.lng === 'number';
  return (
    <Panel
      title={t('comercios.detalle.ubicacion')}
      subtitle={[c.direccion, c.zona].filter(Boolean).join(' · ') || undefined}
      action={<Badge tone={confirmada ? 'ok' : 'warn'}>{confirmada ? t('comercios.detalle.confirmada') : t('comercios.detalle.sinConfirmar')}</Badge>}
    >
      <div className="mt-4 overflow-hidden rounded-field bg-surface-2">
        {hasCoords ? (
          <iframe
            title={t('comercios.detalle.mapa')}
            src={osmEmbedUrl(c.lat as number, c.lng as number)}
            loading="lazy"
            className="block h-56 w-full border-0 md:h-64"
          />
        ) : (
          <div className="flex h-56 flex-col items-center justify-center gap-2 px-4 text-center text-sm text-ink-muted">
            <MapPin size={28} aria-hidden="true" />
            {t('comercios.detalle.sinCoordenadas')}
          </div>
        )}
      </div>
      {hasCoords && (
        <p className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-ink-muted">
          <span>
            {t('comercios.detalle.mapaCoords', { lat: (c.lat as number).toFixed(4), lng: (c.lng as number).toFixed(4) })}
          </span>
          <a href={osmLink(c.lat as number, c.lng as number)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center font-sans text-sm font-bold text-primary-deep">
            {t('comercios.detalle.abrirMapa')}
          </a>
        </p>
      )}
    </Panel>
  );
}

export function TimelineCard({ c, lang, pendienteDecision }: { c: ComercioDetalle; lang: Lang; pendienteDecision: boolean }) {
  const t = useT();
  const eventos = c.linea_de_tiempo ?? [];
  return (
    <Panel title={t('comercios.detalle.timeline')}>
      <ol className="mt-4 flex flex-col">
        {eventos.map((e, i) => (
          <li key={`${e.fecha}-${i}`} className="flex gap-3">
            <span className="flex flex-col items-center">
              <CheckCircle2 size={20} aria-hidden="true" className="flex-none text-primary-deep" />
              {(i < eventos.length - 1 || pendienteDecision) && <span className="my-1 w-px flex-1 bg-line-strong" />}
            </span>
            <div className="pb-4">
              <p className="text-sm font-semibold">{e.evento}</p>
              <p className="text-xs text-ink-muted">{formatDateTime(e.fecha, lang)}</p>
            </div>
          </li>
        ))}
        {pendienteDecision && (
          <li className="flex gap-3">
            <CircleDashed size={20} aria-hidden="true" className="flex-none text-warn" />
            <p className="text-sm font-semibold text-ink-muted">{t('comercios.detalle.pendienteDecision')}</p>
          </li>
        )}
      </ol>
    </Panel>
  );
}
