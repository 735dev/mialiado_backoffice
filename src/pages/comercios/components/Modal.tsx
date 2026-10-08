import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useT } from '@/lib/hooks/useT';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

/** Modal de la feature (Radix Dialog): foco atrapado, Esc cierra, scroll interno en pantallas bajas. */
export function Modal({ open, onClose, title, description, children }: ModalProps) {
  const t = useT();
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-panel bg-surface p-6 text-ink shadow-e2 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Dialog.Title className="text-xl font-extrabold tracking-tight">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-ink-muted">{description}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label={t('common.close')}
              className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-ink-soft hover:bg-surface-2"
            >
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="mt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
