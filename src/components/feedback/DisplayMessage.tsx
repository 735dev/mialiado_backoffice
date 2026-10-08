import * as Dialog from '@radix-ui/react-dialog';
import { CircleCheckBig, MessageCircleQuestion, TriangleAlert, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/hooks/useT';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { hideInfoModal } from '@/lib/store/slices/uiSlice';
import { confirmRegistry } from '@/lib/utils/notify';

const ICONS = {
  error: <XCircle className="text-err" strokeWidth={1.25} size={72} />,
  success: <CircleCheckBig className="text-primary-deep" strokeWidth={1.25} size={72} />,
  warning: <TriangleAlert className="text-amber-500" strokeWidth={1.25} size={72} />,
  confirm: <MessageCircleQuestion className="text-ink-soft" strokeWidth={1.25} size={72} />,
} as const;

/** Modal global de avisos controlado por uiSlice: se abre solo con `notify.*`. */
export function DisplayMessage() {
  const t = useT();
  const dispatch = useAppDispatch();
  const m = useAppSelector((s) => s.ui.infoModal);

  const close = () => {
    if (m.type === 'confirm' && m.confirmActionId) confirmRegistry.discard(m.confirmActionId);
    dispatch(hideInfoModal());
  };

  return (
    <Dialog.Root open={m.open} onOpenChange={(v) => !v && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-40px)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-card bg-surface p-6 text-center text-ink shadow-e2">
          <div className="flex justify-center">{ICONS[m.type]}</div>
          <Dialog.Title className="mt-3 text-lg font-extrabold">{t(`errors.title.${m.code ?? 'generic'}`)}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-ink-muted">{t(m.description)}</Dialog.Description>
          {m.type === 'confirm' ? (
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" size="md" onClick={close}>
                {t('common.cancel')}
              </Button>
              <Button
                size="md"
                onClick={() => {
                  if (m.confirmActionId) confirmRegistry.run(m.confirmActionId);
                  dispatch(hideInfoModal());
                }}
              >
                {t('common.confirm')}
              </Button>
            </div>
          ) : (
            <Button className="mt-6" size="md" onClick={close}>
              {t('common.accept')}
            </Button>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
