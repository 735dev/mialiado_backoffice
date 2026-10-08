import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useT } from '@/lib/hooks/useT';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}

/** Dialogo de la feature (Radix): tarjeta de 24 px, titulo con icono y boton de cierre, como B17. */
export function Modal({ open, onClose, title, subtitle, icon, children }: ModalProps) {
  const t = useT();
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-[61] max-h-[92vh] w-[calc(100vw-2rem)] max-w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card bg-surface p-5 text-ink shadow-e2 sm:p-8"
        >
          <header className="mb-5 flex items-start gap-4">
            {icon && <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-err-tint text-err-deep">{icon}</div>}
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-xl font-extrabold tracking-tight">{title}</Dialog.Title>
              {subtitle && <p className="truncate text-sm text-ink-muted">{subtitle}</p>}
            </div>
            <Dialog.Close
              aria-label={t('common.close')}
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-surface-2 text-ink-soft"
            >
              <X size={18} />
            </Dialog.Close>
          </header>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
