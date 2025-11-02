import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from './ThemeProvider';

/**
 * Hook para crear estilos dinámicos basados en el tema actual
 * Uso: const styles = useDynamicStyles(createStyles);
 * 
 * Donde createStyles es una función que recibe colors y retorna un objeto de estilos
 */
export const useDynamicStyles = (createStylesFn: (colors: any) => any) => {
  const { colors } = useTheme();
  return useMemo(() => createStylesFn(colors), [colors]);
};

