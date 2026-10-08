import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setLang, type Lang } from '@/lib/store/slices/langSlice';

export function useLang() {
  const dispatch = useAppDispatch();
  const lang = useAppSelector((s) => s.lang.current);
  const change = useCallback((l: Lang) => dispatch(setLang(l)), [dispatch]);
  return { lang, setLang: change };
}
