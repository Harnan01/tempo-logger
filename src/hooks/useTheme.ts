import { useState, useCallback } from 'react';
import { darkTheme, lightTheme } from '@/theme/antdTheme';
import type { ThemeConfig } from 'antd';

type ThemeMode = 'dark' | 'light';

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const themeConfig: ThemeConfig = mode === 'dark' ? darkTheme : lightTheme;

  return { mode, toggleTheme, themeConfig } as const;
}
