import type { ReactNode } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { useT } from '@/lib/hooks/useT';
import type { Reglas } from '../models/reglas';
import type { ReglasFormValues } from '../schemas/reglas';
import { useFormato } from '../hooks/useFormato';
import { NumField } from './NumField';

type NumKey = 'ventana_anulacion_min' | 'descuento_max_pct' | 'recarga_minima' | 'compras_mes_mantener' | 'dias_baja_nivel' | 'puja_minima' | 'qr_vigencia_seg';

interface Spec {
  key: NumKey;
  unit?: string;
  prefix?: string;
  step?: string;
}

/** Las tres reglas del prototipo (promociones y cobro) y, aparte, las demas que el backend tambien expone. */
const PRINCIPALES: Spec[] = [
  { key: 'ventana_anulacion_min', unit: 'min' },
  { key: 'descuento_max_pct', unit: '%' },
  { key: 'recarga_minima', prefix: '$', step: '0.01' },
];
const OTRAS: Spec[] = [
  { key: 'compras_mes_mantener' },
  { key: 'dias_baja_nivel' },
  { key: 'puja_minima', prefix: '$', step: '0.01' },
  { key: 'qr_vigencia_seg', unit: 's' },
];

interface ReglasCardProps {
  publicado: Reglas;
  values: ReglasFormValues;
  disabled: boolean;
}

function Row({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-md">
        <div className="font-bold">{title}</div>
        <p className="text-sm text-ink-muted">{description}</p>
      </div>
      {children}
    </li>
  );
}

export function ReglasCard({ publicado, values, disabled }: ReglasCardProps) {
  const t = useT();
  const { money } = useFormato();
  const { control } = useFormContext<ReglasFormValues>();

  const publishedHint = (s: Spec): string | undefined => {
    const pub = publicado.reglas[s.key];
    if (Object.is(pub, values[s.key])) return undefined;
    const shown = s.prefix === '$' ? money(pub) : `${pub}${s.unit ? ` ${s.unit}` : ''}`;
    return t('niveles.reglas.publicado', { valor: shown });
  };

  const field = (s: Spec) => (
    <NumField
      name={s.key}
      label={`niveles.reglas.${s.key}.titulo`}
      unit={s.unit}
      prefix={s.prefix}
      step={s.step}
      disabled={disabled}
      published={publishedHint(s)}
    />
  );

  return (
    <section aria-labelledby="reglas-titulo" className="rounded-panel bg-surface p-5 shadow-e1 md:p-6">
      <h2 id="reglas-titulo" className="text-lg font-extrabold tracking-tight">
        {t('niveles.reglas.titulo')}
      </h2>
      <ul className="mt-2 divide-y divide-line">
        <Row title={t('niveles.reglas.combinacion.titulo')} description={t('niveles.reglas.combinacion.descripcion')}>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge>{t('niveles.reglas.combinacion.descuento')}</Badge>
            <Badge>{t('niveles.reglas.combinacion.flash')}</Badge>
            <Badge tone="ok">{t('niveles.reglas.combinacion.gana')}</Badge>
          </div>
        </Row>
        {PRINCIPALES.map((s) => (
          <Row key={s.key} title={t(`niveles.reglas.${s.key}.titulo`)} description={t(`niveles.reglas.${s.key}.descripcion`)}>
            {field(s)}
          </Row>
        ))}
      </ul>

      <h3 className="mt-6 text-base font-extrabold tracking-tight">{t('niveles.reglas.otras')}</h3>
      <ul className="mt-1 divide-y divide-line">
        <Row title={t('niveles.reglas.moderacion_previa.titulo')} description={t('niveles.reglas.moderacion_previa.descripcion')}>
          <Controller
            control={control}
            name="moderacion_previa"
            render={({ field: f }) => (
              <Switch checked={Boolean(f.value)} onCheckedChange={f.onChange} label={t('niveles.reglas.moderacion_previa.titulo')} disabled={disabled} />
            )}
          />
        </Row>
        {OTRAS.map((s) => (
          <Row key={s.key} title={t(`niveles.reglas.${s.key}.titulo`)} description={t(`niveles.reglas.${s.key}.descripcion`)}>
            {field(s)}
          </Row>
        ))}
      </ul>
    </section>
  );
}
