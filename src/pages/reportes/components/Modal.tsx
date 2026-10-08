import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useT } from '@/lib/hooks/useT';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}

/** Dialogo accesible (Radix): foco atrapado, Escape cierra, titulo y descripcion anunciados. */
export function Modal({ open, onOpenChange, title, description, children }: ModalProps) {
  const t = useT();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card bg-surface p-6 text-ink shadow-e2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-extrabold tracking-tight">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-ink-muted">{description}</Dialog.Description>
            </div>
            <Dialog.Close
              aria-label={t('common.close')}
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-surface-2 text-ink-soft"
            >
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="mt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
