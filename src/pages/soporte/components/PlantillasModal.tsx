import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/hooks/useT';
import type { PlantillaRespuesta } from '../models/ticket';
import { Modal } from './Modal';

interface PlantillasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plantillas: PlantillaRespuesta[];
  /** Sin ticket abierto no hay donde insertar la plantilla. */
  canUse: boolean;
  onUse: (p: PlantillaRespuesta) => void;
}

export function PlantillasModal({ open, onOpenChange, plantillas, canUse, onUse }: PlantillasModalProps) {
  const t = useT();
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t('soporte.templates.title')} description={canUse ? t('soporte.templates.description') : t('soporte.templates.pickTicket')}>
      {plantillas.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-muted">{t('soporte.templates.empty')}</p>
      ) : (
        <ul className="divide-y divide-line">
          {plantillas.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{p.nombre}</div>
                <div className="line-clamp-2 text-xs text-ink-muted">{p.cuerpo}</div>
              </div>
              <Button
                size="md"
                variant="secondary"
                disabled={!canUse}
                onClick={() => {
                  onUse(p);
                  onOpenChange(false);
                }}
              >
                {t('soporte.templates.use')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
