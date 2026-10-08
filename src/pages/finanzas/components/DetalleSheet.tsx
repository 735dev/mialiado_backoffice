import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useT } from '@/lib/hooks/useT';

interface DetalleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

/** Hoja inferior con el detalle de la transaccion en pantallas sin espacio para el panel lateral. */
export function DetalleSheet({ open, onOpenChange, children }: DetalleSheetProps) {
  const t = useT();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-panel bg-bg p-3 text-ink shadow-e2">
          <Dialog.Title className="sr-only">{t('finanzas.detalle.titulo')}</Dialog.Title>
          <Dialog.Description className="sr-only">{t('finanzas.detalle.titulo')}</Dialog.Description>
          <div className="mb-2 flex justify-end">
            <Dialog.Close aria-label={t('common.close')} className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2">
              <X size={18} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
