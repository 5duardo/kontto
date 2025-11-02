export { colors, getThemeColors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius } from './spacing';
export { ThemeProvider, useTheme } from './ThemeProvider';
export { colorSchemes } from './colorSchemes';
export { useDynamicStyles } from './useDynamicStyles';

export const theme = {
  colors: require('./colors').colors,
  typography: require('./typography').typography,
  spacing: require('./spacing').spacing,
  borderRadius: require('./spacing').borderRadius,
};

export type Theme = typeof theme;

