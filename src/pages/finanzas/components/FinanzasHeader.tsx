import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/hooks/useT';

interface FinanzasHeaderProps {
  canApprove: boolean;
  pendientes: number;
  busy: boolean;
  canExport: boolean;
  onConciliar: () => void;
  onExport: () => void;
}

export function FinanzasHeader({ canApprove, pendientes, busy, canExport, onConciliar, onExport }: FinanzasHeaderProps) {
  const t = useT();
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">{t('nav.group.negocio')}</p>
        <h1 className="text-3xl font-extrabold tracking-tight">{t('finanzas.title')}</h1>
        <p className="text-ink-muted">{t('finanzas.subtitle')}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {canApprove && (
          <Button size="md" onClick={onConciliar} disabled={pendientes === 0 || busy}>
            {t('finanzas.conciliar', { n: pendientes })}
          </Button>
        )}
        <Button size="md" variant="secondary" onClick={onExport} disabled={!canExport}>
          <Download size={16} aria-hidden="true" />
          {t('finanzas.exportar')}
        </Button>
      </div>
    </header>
  );
}
