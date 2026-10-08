import { useCallback } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { formatDateTime, formatMoney } from '@/lib/utils/format';

/** Formatos de dinero y fecha segun el idioma activo (una sola fuente para toda la pantalla). */
export function useFormato() {
  const lang = useAppSelector((s) => s.lang.current);
  const money = useCallback((v: number) => formatMoney(v, lang), [lang]);
  const dateTime = useCallback((iso: string) => formatDateTime(iso, lang), [lang]);
  return { lang, money, dateTime };
}
