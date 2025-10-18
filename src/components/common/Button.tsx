import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { borderRadius, spacing, typography, useTheme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'solidPrimary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const buttonStyle: ViewStyle = {
    ...styles.button,
    ...styles[`button_${size}`],
    ...(fullWidth && { width: '100%' }),
    ...(disabled && styles.buttonDisabled),
  };

  const textStyle: TextStyle = {
    ...styles.buttonText,
    ...styles[`buttonText_${size}`],
    ...(variant !== 'solidPrimary' && styles[`buttonText_${variant}`]),
    ...(variant === 'solidPrimary' && styles.buttonText_primary),
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        {...props}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={style}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={buttonStyle}
        >
          {loading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <>
              {icon}
              <Text style={textStyle}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'solidPrimary') {
    return (
      <TouchableOpacity
        {...props}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[buttonStyle, { backgroundColor: colors.primary }, style]}
      >
        {loading ? (
          <ActivityIndicator color={'#FFFFFF'} />
        ) : (
          <>
            {icon}
            <Text style={[textStyle, { color: '#FFFFFF' }]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      {...props}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[buttonStyle, styles[`button_${variant}`], style]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textPrimary}
        />
      ) : (
        <>
          {icon}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  button_small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  button_medium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  button_large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  button_secondary: {
    backgroundColor: colors.secondary,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_solidPrimary: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  buttonText_small: {
    fontSize: typography.sizes.sm,
  },
  buttonText_medium: {
    fontSize: typography.sizes.base,
  },
  buttonText_large: {
    fontSize: typography.sizes.lg,
  },
  buttonText_primary: {
    color: colors.textPrimary,
  },
  buttonText_secondary: {
    color: colors.textPrimary,
  },
  buttonText_outline: {
    color: colors.primary,
  },
  buttonText_ghost: {
    color: colors.primary,
  },
});
