import { colorSchemes } from './colorSchemes';

// Default to dark theme - will be overridden by app context
// Este objeto se usará como fallback para componentes que no usan useTheme
export const colors = colorSchemes.dark;

// Función auxiliar para obtener los colores del tema actual
export const getThemeColors = (theme: 'dark' | 'light') => {
  return colorSchemes[theme];
};

