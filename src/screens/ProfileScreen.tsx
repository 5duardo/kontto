import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, useTheme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ProfileScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, borderRadius), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="construct" size={80} color={colors.primary} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Próximamente</Text>

        {/* Description */}
        <Text style={styles.description}>
          La pantalla de perfil estará disponible muy pronto. Estamos trabajando para traerte las mejores características.
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Gracias por tu paciencia
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colors: any, br: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
