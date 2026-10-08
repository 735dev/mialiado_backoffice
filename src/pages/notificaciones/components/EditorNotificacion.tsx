import { Clock, Send } from 'lucide-react';
import { Controller, useWatch } from 'react-hook-form';
import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { Button } from '@/components/ui/Button';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import type { ParamsEstimar, Segmento } from '../models/notificacion';
import { MENSAJE_MAX, TITULO_MAX, type NotificacionForm } from '../schemas/notificacionSchema';
import { useZonas } from '../hooks/useCatalogos';
import type { useComposer } from '../hooks/useComposer';
import { useEstimacion } from '../hooks/useEstimacion';
import { fmtFechaHora } from '../utils/format';
import { formatInteger } from '@/lib/utils/format';
import { aIsoCaracas, enHorarioSilencioso, horaActualCaracas } from '../utils/horario';
import { CampoContador } from './CampoContador';
import { Segmented } from '@/components/ui/Segmented';
import { SegmentoPicker } from './SegmentoPicker';
import { VistaPrevia } from './VistaPrevia';

const TODOS: ParamsEstimar = { segmento: 'todos', niveles: [], zonas: [] };
const INACTIVOS: ParamsEstimar = { segmento: 'inactivos', niveles: [], zonas: [] };

/** Composer y vista previa de B12 (redactar, segmentar, programar). */
export function EditorNotificacion({ composer }: { composer: ReturnType<typeof useComposer> }) {
  const t = useT();
  const { lang } = useLang();
  const { methods, busy, onSubmit, guardarBorrador, probar } = composer;
  const v = useWatch({ control: methods.control }) as NotificacionForm;
  const zonas = useZonas();

  const estimacion = useEstimacion({ segmento: v.segmento, niveles: v.niveles, zonas: v.zonas });
  const todos = useEstimacion(TODOS);
  const inactivos = useEstimacion(INACTIVOS);
  const conteos: Partial<Record<Segmento, string>> = {
    todos: todos.data ? t('notificaciones.segmento.usuarios', { n: formatInteger(todos.data.alcance, lang) }) : undefined,
    inactivos: inactivos.data ? t('notificaciones.segmento.usuarios', { n: formatInteger(inactivos.data.alcance, lang) }) : undefined,
  };

  const programar = v.cuando === 'programar';
  const iso = programar && v.fecha && v.hora ? aIsoCaracas(v.fecha, v.hora) : null;
  const fechaPrevia = iso && !Number.isNaN(Date.parse(iso)) ? new Date(iso) : new Date();
  const silencioAhora = !programar && enHorarioSilencioso(horaActualCaracas());
  const segmentoTexto = [t(`notificaciones.segmento.${v.segmento}`), segmentoDetalle(v, t)].filter(Boolean).join(' · ');

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
      <section aria-label={t('notificaciones.composer.aria')} className="min-w-0 flex-1 rounded-[28px] bg-surface p-5 shadow-e1 md:p-6">
        <h2 className="text-xl font-extrabold tracking-tight">{t('notificaciones.composer.title')}</h2>
        <Form methods={methods} onSubmit={onSubmit} className="mt-5 gap-5">
          <SegmentoPicker zonas={zonas} conteos={conteos} />
          <CampoContador name="titulo" label={t('notificaciones.composer.titulo')} max={TITULO_MAX} />
          <CampoContador name="mensaje" label={t('notificaciones.composer.mensaje')} max={MENSAJE_MAX} multiline />

          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-2.5 text-sm font-semibold text-ink-soft">{t('notificaciones.cuando.label')}</legend>
            <div className="flex flex-wrap items-start gap-3">
              <Controller
                control={methods.control}
                name="cuando"
                render={({ field }) => (
                  <Segmented
                    size="md"
                    label={t('notificaciones.cuando.label')}
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: 'ahora', label: t('notificaciones.cuando.ahora') },
                      { value: 'programar', label: t('notificaciones.cuando.programar') },
                    ]}
                  />
                )}
              />
              {programar && (
                <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:flex-1">
                  <FormInput<NotificacionForm> name="fecha" type="date" label="notificaciones.cuando.fecha" />
                  <FormInput<NotificacionForm> name="hora" type="time" label="notificaciones.cuando.hora" />
                </div>
              )}
            </div>
            <p className="flex items-start gap-1.5 text-xs font-medium text-ink-muted">
              <Clock size={14} className="mt-px flex-none" aria-hidden="true" />
              {t('notificaciones.cuando.silencio')}
            </p>
            {silencioAhora && (
              <p role="status" className="rounded-field bg-warn-tint px-4 py-3 text-sm font-semibold text-warn">
                {t('notificaciones.cuando.ahoraSilencio')}
              </p>
            )}
          </fieldset>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button type="button" variant="secondary" size="md" onClick={guardarBorrador} isLoading={busy === 'draft'} disabled={busy !== null}>
              {t('notificaciones.saveDraft')}
            </Button>
            <span className="hidden flex-1 sm:block" />
            <Button type="button" variant="secondary" size="md" onClick={() => void probar()} isLoading={busy === 'test'} disabled={busy !== null}>
              <Send size={16} aria-hidden="true" />
              {t('notificaciones.sendTest')}
            </Button>
            <Button type="submit" isLoading={busy === 'send'} disabled={busy !== null}>
              {programar ? t('notificaciones.schedule') : t('notificaciones.sendNow')}
            </Button>
          </div>
        </Form>
      </section>

      <VistaPrevia
        titulo={v.titulo}
        mensaje={v.mensaje}
        segmentoTexto={segmentoTexto}
        saleTexto={programar && iso ? fmtFechaHora(iso, lang) : t('notificaciones.cuando.ahora')}
        hora={new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Caracas' }).format(fechaPrevia)}
        fecha={fechaPrevia}
        lang={lang}
        estimacion={estimacion.data}
        loading={estimacion.loading}
      />
    </div>
  );
}

function segmentoDetalle(v: NotificacionForm, t: ReturnType<typeof useT>): string {
  if (v.segmento === 'nivel') return v.niveles.map((n) => t(`notificaciones.niveles.${n}`)).join(', ');
  if (v.segmento === 'zona') return v.zonas.join(', ');
  return '';
}
