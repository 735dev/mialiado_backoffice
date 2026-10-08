import { Ban } from 'lucide-react';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { NivelCodigo, UsuariosResumen } from '@/providers/usuariosProvider';
import { formatInteger } from '@/lib/utils/format';
import { NIVEL_LABEL, NivelIcon } from './NivelBadge';

const BAR: Record<NivelCodigo, string> = { aliado: 'bg-orange-700', aliadopro: 'bg-slate-600', aliadoplus: 'bg-amber-500' };
const NIVELES: NivelCodigo[] = ['aliado', 'aliadopro', 'aliadoplus'];

function Card({ children }: { children: React.ReactNode }) {
  return <li className="flex flex-col gap-3 rounded-card bg-surface p-5 shadow-e1">{children}</li>;
}

function Bar({ pct, tone }: { pct: number; tone: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-pill bg-surface-2" aria-hidden="true">
      <div className={cn('h-full rounded-pill', tone)} style={{ width: `${Math.min(100, Math.max(pct, pct > 0 ? 3 : 0))}%` }} />
    </div>
  );
}

/** Cuatro tarjetas de B05: una por nivel (con su porcion de la comunidad) y la de bloqueados. */
export function ResumenCards({ resumen }: { resumen: UsuariosResumen | null }) {
  const t = useT();
  const { lang } = useLang();
  const pct = (n: number) => `${n.toLocaleString(lang === 'en' ? 'en-US' : 'es-VE', { maximumFractionDigits: 1 })}%`;
  return (
    <ul aria-label={t('usuarios.resumen.label')} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {NIVELES.map((nivel) => {
        const n = resumen?.niveles.find((x) => x.nivel === nivel);
        return (
          <Card key={nivel}>
            <div className="flex items-center gap-3 font-bold">
              <NivelIcon nivel={nivel} size={18} />
              {NIVEL_LABEL[nivel]}
            </div>
            <p className="text-4xl font-extrabold tracking-tight">{n ? formatInteger(n.usuarios, lang) : '-'}</p>
            <Bar pct={n?.porcentaje ?? 0} tone={BAR[nivel]} />
            <p className="text-xs text-ink-muted">
              {n ? t('usuarios.resumen.deUsuarios', { pct: pct(n.porcentaje), desde: n.desde }) : t('common.loading')}
            </p>
          </Card>
        );
      })}
      <Card>
        <div className="flex items-center gap-3 font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-err-tint text-err-deep">
            <Ban size={18} aria-hidden="true" />
          </span>
          {t('usuarios.tabs.bloqueados')}
        </div>
        <p className="text-4xl font-extrabold tracking-tight">{resumen ? formatInteger(resumen.bloqueados.usuarios, lang) : '-'}</p>
        <p className="text-xs text-ink-muted">{resumen ? t('usuarios.resumen.bloqueadosPct', { pct: pct(resumen.bloqueados.porcentaje) }) : t('common.loading')}</p>
      </Card>
    </ul>
  );
}
