import { useEffect, type ReactNode } from 'react';
import { useTheme } from '@/lib/hooks/useTheme';
import { useLang } from '@/lib/hooks/useLang';

/** Alterna la clase dark en <html> (los tokens de src/styles/tokens.css cambian solos) y fija el idioma del documento. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isDark } = useTheme();
  const { lang } = useLang();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <>{children}</>;
}
