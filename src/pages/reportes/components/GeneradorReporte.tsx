import { CalendarClock, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { Form } from '@/components/form/Form';
import { useZodForm } from '@/components/form/useZodForm';
import { Button } from '@/components/ui/Button';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import { applyServerErrors } from '@/lib/utils/applyServerErrors';
import { notify } from '@/lib/utils/notify';
import { useEstimacionReporte, type useCatalogos } from '../hooks/useReportes';
import { FORMATOS, type Reporte } from '../models/reporte';
import { generarReporte } from '../providers/reportesProvider';
import { aCuerpoReporte, reporteInicial, reporteSchema, type ReporteForm } from '../schemas/reporteSchemas';
import { fmtBytes, fmtNumero } from '../utils/format';
import { PasoColumnas, PasoRango, PasoSegmento, PasoTipo, Paso } from './CamposReporte';
import { Segmented } from './Segmented';

export interface PresetGenerador {
  tipo: Reporte['tipo'];
  formato: Reporte['formato'];
  nombre: string;
  n: number;
}

interface Props {
  catalogos: ReturnType<typeof useCatalogos>;
  canEdit: boolean;
  preset: PresetGenerador | null;
  onGenerated: () => void;
  onSchedule: () => void;
}

/** «Nuevo reporte»: 5 pasos (tipo, fechas, segmento, columnas, formato), estimacion y generacion inmediata. */
export function GeneradorReporte({ catalogos, canEdit, preset, onGenerated, onSchedule }: Props) {
  const t = useT();
  const { lang } = useLang();
  const { columnas: catalogo, categorias, zonas } = catalogos;
  const methods = useZodForm<ReporteForm>(reporteSchema, reporteInicial);
  const [generando, setGenerando] = useState(false);
  const v = useWatch({ control: methods.control }) as ReporteForm;

  // Las columnas predeterminadas llegan con el catalogo: se aplican una vez, si todavia no hay ninguna.
  useEffect(() => {
    if (catalogo && methods.getValues('columnas').length === 0) {
      methods.setValue('columnas', catalogo.por_defecto[methods.getValues('tipo')] ?? []);
    }
  }, [catalogo, methods]);

  useEffect(() => {
    if (!preset || !catalogo) return;
    methods.setValue('tipo', preset.tipo);
    methods.setValue('formato', preset.formato === 'pdf' ? 'xlsx' : preset.formato);
    methods.setValue('nombre', preset.nombre);
    methods.setValue('columnas', catalogo.por_defecto[preset.tipo] ?? []);
  }, [preset, catalogo, methods]);

  const valido = v.columnas.length > 0 && v.formato !== 'pdf' && !(v.desde && v.hasta && v.desde > v.hasta);
  const estimacion = useEstimacionReporte(valido ? aCuerpoReporte(v) : null);

  const onSubmit = async (form: ReporteForm) => {
    setGenerando(true);
    const res = await generarReporte(aCuerpoReporte(form));
    setGenerando(false);
    if (!res.ok) {
      applyServerErrors(methods.setError, res);
      notify.fromApiError(res);
      return;
    }
    if (res.data.estado === 'fallo') notify.error(t('reportes.generator.failed'), 500);
    else notify.toast.success(t('reportes.generator.ready', { nombre: res.data.nombre }));
    onGenerated();
  };

  return (
    <section aria-label={t('reportes.generator.aria')} className="min-w-0 rounded-[28px] bg-surface p-5 shadow-e1 md:p-7 xl:w-[620px] xl:flex-none">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold tracking-tight">{t('reportes.generator.title')}</h2>
        <span className="inline-flex h-7 items-center rounded-pill bg-surface-2 px-3 text-xs font-semibold text-ink-soft">{t('reportes.generator.draft')}</span>
      </div>
      <Form methods={methods} onSubmit={onSubmit} className="mt-6 gap-6">
        <PasoTipo catalogo={catalogo} />
        <PasoRango />
        <PasoSegmento categorias={categorias} zonas={zonas} />
        <PasoColumnas catalogo={catalogo} />
        <Paso n={5} titulo={t('reportes.steps.format')}>
          <Controller
            control={methods.control}
            name="formato"
            render={({ field }) => (
              <Segmented
                label={t('reportes.steps.format')}
                value={field.value}
                onChange={field.onChange}
                options={FORMATOS.map((f) => ({ value: f, label: f.toUpperCase(), disabled: f === 'pdf', describedBy: 'aviso-pdf' }))}
              />
            )}
          />
          <p id="aviso-pdf" className="flex items-start gap-1.5 text-xs font-medium text-ink-muted">
            <Info size={14} className="mt-px flex-none" aria-hidden="true" />
            {t('reportes.generator.pdfNotice')}
          </p>
        </Paso>

        <div className="flex items-center gap-3.5 rounded-[20px] bg-primary-tint px-[18px] py-4 text-primary-deep" role="status" aria-busy={estimacion.loading}>
          <Info size={20} className="flex-none" aria-hidden="true" />
          <p className="text-sm font-semibold">
            {estimacion.data
              ? t('reportes.generator.estimate', {
                  filas: fmtNumero(estimacion.data.filas, lang),
                  columnas: estimacion.data.columnas,
                  peso: fmtBytes(estimacion.data.bytes_aprox, lang),
                })
              : t(estimacion.loading ? 'reportes.generator.estimating' : 'reportes.generator.estimateNone')}
          </p>
        </div>

        {canEdit ? (
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" size="md" onClick={onSchedule}>
              <CalendarClock size={16} aria-hidden="true" />
              {t('reportes.generator.schedule')}
            </Button>
            <Button type="submit" isLoading={generando}>
              {t('reportes.generator.generate')}
            </Button>
          </div>
        ) : (
          <p role="status" className="text-sm font-medium text-ink-muted">
            {t('reportes.generator.readOnly')}
          </p>
        )}
      </Form>
    </section>
  );
}
