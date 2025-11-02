/**
 * Este archivo proporciona funciones helper para trabajar con StyleSheet dinámicos
 * que responden a cambios de tema.
 */

import { StyleSheet } from 'react-native';
import { typography } from '../theme/typography';

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

/**
 * Helper para obtener el fontFamily basado en el weight
 * @param weight - El peso de la fuente (regular, medium, semibold, bold)
 * @returns El nombre de la fuente Neo Sans correspondiente
 */
export const getFontFamily = (weight: keyof typeof typography.fontFamily = 'regular') => {
  return typography.fontFamily[weight] || typography.fontFamily.regular;
};

/**
 * Helper para crear estilos de texto con Neo Sans
 * @param weight - El peso de la fuente
 * @returns Objeto con fontFamily para usar en estilos
 */
export const withNeoSans = (weight: keyof typeof typography.fontFamily = 'regular') => ({
  fontFamily: getFontFamily(weight),
});


