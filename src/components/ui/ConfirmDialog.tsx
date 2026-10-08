import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/hooks/useT';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  /** Accion destructiva o irreversible: boton rojo. */
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  /** Campo extra bajo la descripcion (p. ej. el resumen de una version). */
  children?: ReactNode;
}

/** Confirmacion de una accion con efecto inmediato: dice que pasara y exige un clic explicito. No se cierra mientras trabaja. */
export function ConfirmDialog({ open, title, description, confirmLabel, danger, busy, onConfirm, onClose, children }: ConfirmDialogProps) {
  const t = useT();
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && !busy && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-card bg-surface p-6 text-ink shadow-e2">
          <Dialog.Title className="text-lg font-extrabold tracking-tight">{title}</Dialog.Title>
          <Dialog.Description asChild>
            <div className="mt-2 text-sm text-ink-muted">{description}</div>
          </Dialog.Description>
          {children}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="md" onClick={onClose} disabled={busy}>
              {t('common.cancel')}
            </Button>
            <Button variant={danger ? 'danger' : 'primary'} size="md" onClick={onConfirm} isLoading={busy}>
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
