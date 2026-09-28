import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

export const lightColors = {
  bg: '#F4F5F9',
  card: '#FFFFFF',
  text: '#1C2024',
  subText: '#60646C',
  faint: '#B9BBC6',
  border: '#E4E5EA',
  primary: '#5B5BD6',
  primarySoft: '#EDEDFC',
  danger: '#E5484D',
  dangerSoft: '#FDEBEC',
  warn: '#F76B15',
  warnSoft: '#FFEFD6',
  success: '#218358',
  successSoft: '#E6F6EB',
};

export type Colors = typeof lightColors;

export const darkColors: Colors = {
  bg: '#111113',
  card: '#1C1C1F',
  text: '#EDEEF0',
  subText: '#B0B4BA',
  faint: '#5A5E66',
  border: '#2E3035',
  primary: '#6E6ADE',
  primarySoft: '#26264A',
  danger: '#EC5D5E',
  dangerSoft: '#3B1219',
  warn: '#FF8B3E',
  warnSoft: '#3A2410',
  success: '#3DD68C',
  successSoft: '#132D21',
};

/** auto: 端末の設定に合わせる */
export type ThemeMode = 'auto' | 'light' | 'dark';

type ThemeValue = {
  colors: Colors;
  scheme: 'light' | 'dark';
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeValue>({
  colors: lightColors,
  scheme: 'light',
  mode: 'auto',
  setMode: () => {},
});

const MODE_KEY = 'settings:themeMode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('auto');

  useEffect(() => {
    AsyncStorage.getItem(MODE_KEY)
      .then((saved) => {
        if (saved === 'auto' || saved === 'light' || saved === 'dark') setModeState(saved);
      })
      .catch(() => {});
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(MODE_KEY, next).catch(() => {});
  }, []);

  const scheme = mode === 'auto' ? (system === 'dark' ? 'dark' : 'light') : mode;
  const value = useMemo(
    () => ({ colors: scheme === 'dark' ? darkColors : lightColors, scheme, mode, setMode }),
    [scheme, mode, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}

export function useColors(): Colors {
  return useContext(ThemeContext).colors;
}
