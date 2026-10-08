import { useCallback } from 'react';
import { dictionaries, translate } from '@/lib/i18n';
import { useAppSelector } from '@/lib/store/hooks';

export type TFunction = (keyOrText: string, vars?: Record<string, string | number>) => string;

export function useT(): TFunction {
  const lang = useAppSelector((s) => s.lang.current);
  return useCallback<TFunction>((keyOrText, vars) => translate(dictionaries[lang], keyOrText, vars), [lang]);
}
