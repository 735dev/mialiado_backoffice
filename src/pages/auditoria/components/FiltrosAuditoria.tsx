import { Search } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { Select } from '@/components/ui/Input';
import { useT } from '@/lib/hooks/useT';
import { ACCIONES_CONOCIDAS, MODULOS_CONOCIDOS, type Persona } from '../models/evento';
import { RANGOS, type FiltrosForm } from '../schemas/filtrosSchema';
import type { useAuditoria } from '../hooks/useAuditoria';

const PILL = 'h-11 w-auto min-w-[8.5rem] flex-1 rounded-pill px-4 text-sm font-semibold sm:flex-none';

interface Props {
  methods: ReturnType<typeof useAuditoria>['methods'];
  personas: Persona[];
}

/** Barra de filtros: accion, persona, modulo, rango de fechas y busqueda. Cada cambio vuelve a consultar desde la pagina 1. */
export function FiltrosAuditoria({ methods, personas }: Props) {
  const t = useT();
  const rango = useWatch({ control: methods.control, name: 'rango' });
  const reg = methods.register;
  return (
    <Form methods={methods} onSubmit={() => undefined} className="gap-3 px-5 py-5 md:px-7" role="search" aria-label={t('auditoria.filters.aria')}>
      <div className="flex flex-wrap items-center gap-2.5 lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <Select aria-label={t('auditoria.filters.action')} className={PILL} {...reg('accion')}>
            <option value="">{t('auditoria.filters.allActions')}</option>
            {ACCIONES_CONOCIDAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
          <Select aria-label={t('auditoria.filters.person')} className={PILL} {...reg('persona')}>
            <option value="">{t('auditoria.filters.allPeople')}</option>
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </Select>
          <Select aria-label={t('auditoria.filters.module')} className={PILL} {...reg('modulo')}>
            <option value="">{t('auditoria.filters.allModules')}</option>
            {MODULOS_CONOCIDOS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Select aria-label={t('auditoria.filters.range')} className={PILL} {...reg('rango')}>
            {RANGOS.map((r) => (
              <option key={r} value={r}>
                {t(`auditoria.filters.ranges.${r}`)}
              </option>
            ))}
          </Select>
        </div>
        <label className="flex h-12 w-full items-center gap-2.5 rounded-pill bg-surface-2 px-4 text-ink-muted focus-within:ring-2 focus-within:ring-primary-deep lg:w-80">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">{t('auditoria.filters.searchLabel')}</span>
          <input
            type="search"
            placeholder={t('auditoria.filters.search')}
            className="min-w-0 flex-1 border-0 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink-muted"
            {...reg('q')}
          />
        </label>
      </div>
      {rango === 'personalizado' && (
        <div className="grid grid-cols-1 gap-3 sm:max-w-md sm:grid-cols-2">
          <FormInput<FiltrosForm> name="desde" type="date" label="auditoria.filters.from" />
          <FormInput<FiltrosForm> name="hasta" type="date" label="auditoria.filters.to" />
        </div>
      )}
    </Form>
  );
}
