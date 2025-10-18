import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { borderRadius, spacing, useTheme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  gradientColors?: [string, string, ...string[]];
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  gradient = false,
  gradientColors,
  onPress,
  ...props
}) => {
  const { colors } = useTheme();
  const defaultGradientColors = gradientColors || [colors.surface, colors.surfaceHover];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const content = (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {gradient ? (
          <LinearGradient
            colors={defaultGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, style]}
          >
            {children}
          </LinearGradient>
        ) : (
          content
        )}
      </TouchableOpacity>
    );
  }

  if (gradient) {
    return (
      <LinearGradient
        colors={defaultGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return content;
};

const createStyles = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
