import { Toaster } from 'sonner';
import { useTheme } from '@/lib/hooks/useTheme';

export function ToasterRoot() {
  const { isDark } = useTheme();
  return (
    <Toaster
      richColors
      closeButton
      theme={isDark ? 'dark' : 'light'}
      position="top-center"
      offset="calc(env(safe-area-inset-top, 0px) + 12px)"
      toastOptions={{ style: { fontFamily: 'inherit', borderRadius: 18 } }}
    />
  );
}
