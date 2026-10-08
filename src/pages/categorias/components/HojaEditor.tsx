import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useT } from '@/lib/hooks/useT';

interface HojaEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

/** Hoja inferior con el editor de la categoria en pantallas sin espacio para el panel lateral. */
export function HojaEditor({ open, onOpenChange, children }: HojaEditorProps) {
  const t = useT();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-panel bg-bg p-3 text-ink shadow-e2">
          <Dialog.Title className="sr-only">{t('categorias.editor.titulo')}</Dialog.Title>
          <Dialog.Description className="sr-only">{t('categorias.editor.titulo')}</Dialog.Description>
          <Dialog.Close aria-label={t('common.close')} className="sr-only">
            <X size={18} />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
