import { useCallback } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { formatDateTime, formatMoney } from '@/lib/utils/format';

/** Formatos de dinero y fecha segun el idioma activo. */
export function useFormato() {
  const lang = useAppSelector((s) => s.lang.current);
  const money = useCallback((v: number) => formatMoney(v, lang), [lang]);
  const fecha = useCallback((iso: string) => formatDateTime(iso, lang), [lang]);
  return { lang, money, fecha };
}
