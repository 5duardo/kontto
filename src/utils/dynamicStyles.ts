/**
 * Este archivo proporciona funciones helper para trabajar con StyleSheet dinámicos
 * que responden a cambios de tema.
 */

import { StyleSheet } from 'react-native';

/**
 * Wrapper dinámico para StyleSheet.create que puede ser usado con colores dinámicos
 * 
 * Uso:
 * const getStyles = (colors) => ({
 *   container: { backgroundColor: colors.background }
 * });
 * const styles = useMemo(() => StyleSheet.create(getStyles(colors)), [colors]);
 */

export const createDynamicStyles = (createStylesFn: (colors: any) => any, colors: any) => {
  return StyleSheet.create(createStylesFn(colors));
};
