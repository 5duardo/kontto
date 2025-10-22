export type ColorScheme = 'dark' | 'light';

export const accentColorMap: Record<string, string> = {
  blue: '#004CE3',
  purple: '#8B5CF6',
  pink: '#EC4899',
  green: '#10B981',
  orange: '#F59E0B',
  red: '#EF4444',
};

export const colorSchemes = {
  dark: {
    // Backgrounds
    background: '#0D1117',
    backgroundSecondary: '#161B22',
    backgroundTertiary: '#1C2128',

    // Surfaces
    surface: '#21262D',
    surfaceHover: '#2D333B',

    // Text
    textPrimary: '#E6EDF3',
    textSecondary: '#8B949E',
    textTertiary: '#6E7681',

    // Accents
    primary: '#0055FC', // Azul
    primaryDark: '#059669',
    secondary: '#8B5CF6', // Violeta
    secondaryDark: '#7C3AED',
    accent: '#06B6D4', // Azul petróleo
    accentDark: '#0891B2',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Income/Expense
    income: '#10B981',
    expense: '#EF4444',

    // Borders
    border: '#30363D',
    borderLight: '#373E47',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',

    // Category Colors
    categoryColors: [
      '#EF4444', // Rojo
      '#F59E0B', // Ámbar
      '#10B981', // Verde
      '#06B6D4', // Cyan
      '#3B82F6', // Azul
      '#8B5CF6', // Violeta
      '#EC4899', // Rosa
      '#6B7280', // Gris
    ],
  },
  light: {
    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F7F8FA',
    backgroundTertiary: '#F0F1F3',

    // Surfaces
    surface: '#F7F8FA',
    surfaceHover: '#EAEDF2',

    // Text
    textPrimary: '#1C1F26',
    textSecondary: '#57606A',
    textTertiary: '#808A98',

    // Accents
    primary: '#0055FC', // Azul
    primaryDark: '#059669',
    secondary: '#8B5CF6', // Violeta
    secondaryDark: '#7C3AED',
    accent: '#06B6D4', // Azul petróleo
    accentDark: '#0891B2',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Income/Expense
    income: '#10B981',
    expense: '#EF4444',

    // Borders
    border: '#D8DEEA',
    borderLight: '#E5ECFA',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.6)',
    overlayLight: 'rgba(0, 0, 0, 0.4)',

    // Category Colors
    categoryColors: [
      '#EF4444', // Rojo
      '#F59E0B', // Ámbar
      '#10B981', // Verde
      '#06B6D4', // Cyan
      '#3B82F6', // Azul
      '#8B5CF6', // Violeta
      '#EC4899', // Rosa
      '#6B7280', // Gris
    ],
  },
};
