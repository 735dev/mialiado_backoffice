import { Check } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect, type SelectOption } from '@/components/form/FormSelect';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import { NIVELES, TIPOS, type CatalogoColumnas, type Categoria, type Zona } from '../models/reporte';
import type { ReporteForm } from '../schemas/reporteSchemas';
import { hoyCaracas, rangoRapido, type RangoRapido } from '../utils/format';

const RANGOS: RangoRapido[] = ['ultimos7', 'esteMes', 'mesAnterior', 'ultimos90'];

export function Paso({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2.5">
      <legend className="mb-2.5 text-sm font-bold text-ink-soft">
        {n} · {titulo}
      </legend>
      {children}
    </fieldset>
  );
}

/** Paso 1: tipo de reporte. Al cambiar, las columnas vuelven a las predeterminadas del tipo. */
export function PasoTipo({ catalogo }: { catalogo: CatalogoColumnas | null }) {
  const t = useT();
  const { control, setValue } = useFormContext<ReporteForm>();
  return (
    <Paso n={1} titulo={t('reportes.steps.type')}>
      <Controller
        control={control}
        name="tipo"
        render={({ field }) => (
          <div className="flex flex-wrap gap-2">
            {TIPOS.map((tipo) => (
              <button
                key={tipo}
                type="button"
                aria-pressed={field.value === tipo}
                onClick={() => {
                  field.onChange(tipo);
                  setValue('columnas', catalogo?.por_defecto[tipo] ?? [], { shouldValidate: true });
                }}
                className={cn(
                  'inline-flex h-11 items-center gap-2 rounded-pill border-[1.5px] px-[18px] text-sm font-bold transition-colors',
                  field.value === tipo ? 'border-primary-deep bg-primary-tint text-primary-deep' : 'border-line-strong bg-surface text-ink-soft hover:bg-surface-2',
                )}
              >
                {field.value === tipo && <Check size={15} strokeWidth={3} aria-hidden="true" />}
                {t(`reportes.tipo.${tipo}`)}
              </button>
            ))}
          </div>
        )}
      />
    </Paso>
  );
}

/** Paso 2: rango de fechas con atajos. */
export function PasoRango() {
  const t = useT();
  const { setValue } = useFormContext<ReporteForm>();
  return (
    <Paso n={2} titulo={t('reportes.steps.range')}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormInput<ReporteForm> name="desde" type="date" label="reportes.fields.from" />
        <FormInput<ReporteForm> name="hasta" type="date" label="reportes.fields.to" />
      </div>
      <div className="flex flex-wrap gap-2">
        {RANGOS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              const rango = rangoRapido(r, hoyCaracas());
              setValue('desde', rango.desde, { shouldValidate: true });
              setValue('hasta', rango.hasta, { shouldValidate: true });
            }}
            className="inline-flex h-9 items-center rounded-pill border-[1.5px] border-line-strong px-[18px] text-sm font-semibold text-ink-soft hover:bg-surface-2"
          >
            {t(`reportes.quick.${r}`)}
          </button>
        ))}
      </div>
    </Paso>
  );
}

/** Paso 3: categoria, zona y nivel (todos opcionales). */
export function PasoSegmento({ categorias, zonas }: { categorias: Categoria[]; zonas: Zona[] }) {
  const t = useT();
  const cats: SelectOption[] = categorias.flatMap((c) => [
    { value: c.id, label: c.nombre },
    ...(c.subcategorias ?? []).map((s) => ({ value: s.id, label: `— ${s.nombre}` })),
  ]);
  return (
    <Paso n={3} titulo={t('reportes.steps.segment')}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormSelect<ReporteForm> name="categoria_id" label="reportes.fields.category" placeholder="reportes.fields.all" options={cats} />
        <FormSelect<ReporteForm> name="zona" label="reportes.fields.zone" placeholder="reportes.fields.all" options={zonas.map((z) => ({ value: z.nombre, label: z.nombre }))} />
        <FormSelect<ReporteForm>
          name="nivel"
          label="reportes.fields.level"
          placeholder="reportes.fields.allMasc"
          options={NIVELES.map((n) => ({ value: n, label: `reportes.niveles.${n}` }))}
        />
      </div>
    </Paso>
  );
}

/** Paso 4: columnas del tipo elegido (marcadas las predeterminadas). */
export function PasoColumnas({ catalogo }: { catalogo: CatalogoColumnas | null }) {
  const t = useT();
  const { control, watch } = useFormContext<ReporteForm>();
  const tipo = watch('tipo');
  const disponibles = catalogo?.columnas[tipo] ?? [];
  return (
    <Paso n={4} titulo={t('reportes.steps.columns')}>
      <Controller
        control={control}
        name="columnas"
        render={({ field, fieldState }) => (
          <>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
              {disponibles.map((c) => {
                const on = field.value.includes(c);
                return (
                  <label key={c} className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => field.onChange(on ? field.value.filter((x) => x !== c) : disponibles.filter((x) => x === c || field.value.includes(x)))}
                      className="h-5 w-5 flex-none rounded-[6px] accent-primary-deep"
                    />
                    {t(`reportes.col.${c}`)}
                  </label>
                );
              })}
            </div>
            {fieldState.error && (
              <small role="alert" className="text-sm font-medium text-err">
                {t(fieldState.error.message ?? 'errors.invalid')}
              </small>
            )}
          </>
        )}
      />
    </Paso>
  );
}
