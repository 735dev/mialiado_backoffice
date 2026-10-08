import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/hooks/useT';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
}

/** Confirmacion de un cambio que rige de inmediato para toda la red; admite un campo extra (resumen de la version). */
export function ConfirmDialog({ open, title, description, confirmLabel, busy, onConfirm, onClose, children }: ConfirmDialogProps) {
  const t = useT();
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && !busy && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-card bg-surface p-6 text-ink shadow-e2">
          <Dialog.Title className="text-lg font-extrabold tracking-tight">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-ink-muted">{description}</Dialog.Description>
          {children}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="md" onClick={onClose} disabled={busy}>
              {t('common.cancel')}
            </Button>
            <Button size="md" onClick={onConfirm} isLoading={busy}>
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
