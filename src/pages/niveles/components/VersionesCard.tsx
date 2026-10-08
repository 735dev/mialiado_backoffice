import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { useFormato } from '../hooks/useFormato';
import type { Version } from '../models/reglas';
import { listarVersiones } from '../providers/reglasProvider';

interface VersionesCardProps {
  versiones: Version[];
  actual: number;
  borrador: { version: number; autor: string } | null;
  canRestore: boolean;
  onRestore: (v: Version) => void;
  expanded: boolean;
  onExpandedChange: (v: boolean) => void;
}

const RESUMIDO = 4;

/** Historial de versiones: la vigente, las anteriores con "Restaurar" y, si hay cambios, la fila del borrador. */
export function VersionesCard({ versiones, actual, borrador, canRestore, onRestore, expanded, onExpandedChange }: VersionesCardProps) {
  const t = useT();
  const { puede } = useAuth();
  const { fecha } = useFormato();
  const [todas, setTodas] = useState<Version[] | null>(null);
  const [cargando, setCargando] = useState(false);

  const sorted = [...(todas ?? versiones)].sort((a, b) => b.version - a.version);
  const visibles = expanded ? sorted : sorted.slice(0, RESUMIDO);

  const toggle = async () => {
    if (!expanded && todas === null) {
      setCargando(true);
      const res = await listarVersiones();
      setCargando(false);
      if (res.ok) setTodas(res.data);
    }
    onExpandedChange(!expanded);
  };

  return (
    <section id="historial" aria-labelledby="versiones-titulo" className="rounded-panel bg-surface p-5 shadow-e1">
      <div className="flex items-center justify-between gap-3">
        <h2 id="versiones-titulo" className="text-lg font-extrabold tracking-tight">
          {t('niveles.versiones.titulo')}
        </h2>
        {(versiones.length > RESUMIDO || expanded) && (
          <button type="button" onClick={() => void toggle()} disabled={cargando} className="inline-flex min-h-11 items-center text-sm font-bold text-primary-deep underline disabled:opacity-50">
            {expanded ? t('niveles.versiones.verMenos') : t('niveles.versiones.verTodo')}
          </button>
        )}
      </div>

      <ul className="mt-3 flex flex-col divide-y divide-line">
        {borrador && (
          <li className="flex items-center justify-between gap-3 py-3">
            <div>
              <span className="font-mono text-xs font-bold text-ink-muted">v{borrador.version}</span>
              <div className="font-bold">{t('niveles.versiones.borradorDe', { autor: borrador.autor })}</div>
              <div className="text-xs text-ink-muted">{t('niveles.versiones.sinPublicar')}</div>
            </div>
            <Badge tone="warn">{t('niveles.previa.borrador')}</Badge>
          </li>
        )}
        {visibles.map((v) => (
          <li key={v.version} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <span className="font-mono text-xs font-bold text-ink-muted">v{v.version}</span>
              <div className="truncate font-bold">{v.resumen}</div>
              <div className="text-xs text-ink-muted">
                {fecha(v.fecha)} · {v.autor}
              </div>
            </div>
            {v.version === actual ? (
              <Badge tone="ok">{t('niveles.versiones.vigente')}</Badge>
            ) : (
              canRestore && (
                <Button size="md" variant="secondary" className="h-11 px-4 md:h-9" onClick={() => onRestore(v)}>
                  {t('niveles.versiones.restaurar')}
                </Button>
              )
            )}
          </li>
        ))}
      </ul>
      {puede('auditoria') && (
        <Link to={PATHS.auditoria} className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-primary-deep">
          {t('niveles.versiones.verAuditoria')}
        </Link>
      )}
    </section>
  );
}
