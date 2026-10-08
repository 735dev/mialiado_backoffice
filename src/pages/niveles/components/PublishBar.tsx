import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/hooks/useT';

interface PublishBarProps {
  cambios: number;
  busy: boolean;
  onDiscard: () => void;
}

/** Barra fija de "Cambios sin publicar": aparece solo si el borrador difiere de lo publicado. */
export function PublishBar({ cambios, busy, onDiscard }: PublishBarProps) {
  const t = useT();
  if (cambios === 0) return null;
  return (
    <div
      role="region"
      aria-label={t('niveles.publicar.sinPublicar')}
      className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-panel bg-ink p-4 text-bg shadow-e2 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <div className="font-extrabold">{t('niveles.publicar.sinPublicar')}</div>
        <div className="text-sm opacity-80">{t('niveles.publicar.detalle', { n: cambios })}</div>
      </div>
      <div className="flex gap-3">
        <Button size="md" variant="secondary" onClick={onDiscard} disabled={busy}>
          {t('niveles.publicar.descartar')}
        </Button>
        <Button size="md" type="submit" isLoading={busy}>
          {t('niveles.publicar.publicar')}
        </Button>
      </div>
    </div>
  );
}
