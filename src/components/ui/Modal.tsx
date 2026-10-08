import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useT } from '@/lib/hooks/useT';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Texto bajo el titulo (se anuncia como descripcion del dialogo). */
  description?: string;
  /** Linea corta bajo el titulo, junto al `icon` (estilo B17: cabecera con icono). */
  subtitle?: string;
  /** Icono en circulo rojo suave a la izquierda del titulo. */
  icon?: ReactNode;
  children: ReactNode;
}

/** Dialogo accesible (Radix): foco atrapado, Esc cierra, scroll interno en pantallas bajas, titulo y descripcion anunciados. */
export function Modal({ open, onClose, title, description, subtitle, icon, children }: ModalProps) {
  const t = useT();
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card bg-surface p-5 text-ink shadow-e2 sm:p-8">
          <header className="flex items-start gap-4">
            {icon && <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-err-tint text-err-deep">{icon}</div>}
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-xl font-extrabold tracking-tight">{title}</Dialog.Title>
              {subtitle && <p className="truncate text-sm text-ink-muted">{subtitle}</p>}
              <Dialog.Description className={description ? 'mt-1 text-sm text-ink-muted' : 'sr-only'}>{description ?? title}</Dialog.Description>
            </div>
            <Dialog.Close aria-label={t('common.close')} className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-ink-soft hover:bg-surface-2">
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </header>
          <div className="mt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
