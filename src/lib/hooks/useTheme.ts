import { useCallback } from 'react';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setTheme, toggleTheme, type ThemeMode } from '@/lib/store/slices/themeSlice';

export function useTheme() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const isDark = mode === 'dark' || (mode === 'system' && systemDark);

  const setMode = useCallback((m: ThemeMode) => dispatch(setTheme(m)), [dispatch]);
  const toggle = useCallback(() => dispatch(toggleTheme()), [dispatch]);
  return { mode, isDark, setMode, toggle };
}
