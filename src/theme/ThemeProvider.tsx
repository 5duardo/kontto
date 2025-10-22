import React, { createContext, useContext, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { colorSchemes, accentColorMap } from './colorSchemes';

interface ThemeContextType {
  colors: typeof colorSchemes.dark;
  theme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useAppStore((state) => state.theme);
  const accentColor = useAppStore((state) => state.accentColor);

  const colors = useMemo(() => {
    const baseColors = colorSchemes[theme];
    const accentHexColor = accentColorMap[accentColor] || accentColorMap.blue;

    return {
      ...baseColors,
      primary: accentHexColor,
    };
  }, [theme, accentColor]);

  return (
    <ThemeContext.Provider value={{ colors, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
