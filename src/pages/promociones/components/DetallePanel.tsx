import { Check, Pencil, X } from 'lucide-react';
import { useState } from 'react';
import { Form } from '@/components/form/Form';
import { FormTextarea } from '@/components/form/FormTextarea';
import { useZodForm } from '@/components/form/useZodForm';
import { Button } from '@/components/ui/Button';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import type { MotivoRechazo, PromoDetalle } from '@/providers/promocionesProvider';
import { haceCuanto } from '../format';
import { initials } from '@/lib/utils/format';
import { cambiosSchema, type CambiosValues } from '../schemas/moderacion';
import { TipoPill } from './ColaRevision';
import { PromoPreview } from './PromoPreview';
import { RechazarModal } from './RechazarModal';
import { PreciosPorNivel, ReglasCard } from './ReglasCard';

interface Props {
  promo: PromoDetalle;
  puedeAprobar: boolean;
  busy: boolean;
  onAprobar: () => void;
  onRechazar: (motivo: MotivoRechazo, comentario: string | undefined) => Promise<boolean>;
  onPedirCambios: (comentario: string) => Promise<boolean>;
}

/** Detalle de la promocion seleccionada: vista previa, reglas automaticas, precios por nivel y acciones de moderacion. */
export function DetallePanel({ promo, puedeAprobar, busy, onAprobar, onRechazar, onPedirCambios }: Props) {
  const t = useT();
  const { lang } = useLang();
  const [rechazando, setRechazando] = useState(false);
  const methods = useZodForm<CambiosValues>(cambiosSchema, { comentario: '' });

  const pedirCambios = async (v: CambiosValues) => {
    if (await onPedirCambios(v.comentario)) methods.reset({ comentario: '' });
  };

  return (
    <article aria-label={promo.titulo} className="flex min-w-0 flex-col gap-6 rounded-card bg-surface p-5 shadow-e1 sm:p-6">
      <header className="flex items-start gap-4">
        <span aria-hidden="true" className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-warn-tint font-extrabold text-warn">
          {initials(promo.comercio.nombre)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-extrabold leading-8 tracking-tight">{promo.titulo}</h2>
          <p className="text-sm text-ink-muted">{t('promociones.detalle.enviadaPor', { comercio: promo.comercio.nombre, nombre: promo.enviada_por, cuando: haceCuanto(promo.creada, lang) })}</p>
        </div>
        <TipoPill tipo={promo.tipo} />
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <PromoPreview key={promo.id} p={promo} />
        <ReglasCard p={promo} />
      </div>

      <PreciosPorNivel p={promo} />

      <Form methods={methods} onSubmit={pedirCambios} className="gap-4">
        <FormTextarea<CambiosValues> name="comentario" label="promociones.detalle.nota" placeholder="promociones.detalle.notaEjemplo" hint="promociones.detalle.notaAyuda" rows={2} />
        {!puedeAprobar && <p className="rounded-field bg-surface-2 px-4 py-3 text-sm text-ink-soft">{t('promociones.detalle.soloLectura')}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="danger" size="md" disabled={!puedeAprobar || busy} onClick={() => setRechazando(true)}>
            <X size={18} aria-hidden="true" />
            {t('promociones.acciones.rechazar')}
          </Button>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="secondary" size="md" disabled={!puedeAprobar || busy}>
              <Pencil size={16} aria-hidden="true" />
              {t('promociones.acciones.pedirCambios')}
            </Button>
            <Button size="md" disabled={!puedeAprobar} isLoading={busy} onClick={onAprobar}>
              <Check size={18} aria-hidden="true" />
              {t('promociones.acciones.aprobar')}
            </Button>
          </div>
        </div>
      </Form>

      <RechazarModal promo={promo} open={rechazando} onClose={() => setRechazando(false)} onSubmit={onRechazar} />
    </article>
  );
}
