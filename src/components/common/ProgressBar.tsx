import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { borderRadius, spacing, typography, useTheme } from '../../theme';

interface ProgressBarProps {
  progress: number; // Can be 0-1 or 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  backgroundColor,
  height = 8,
  showPercentage = false,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // Determine final color: allow `color` prop to override automatic status coloring
  // Automatic coloring uses theme status colors (success/warning/error) based on
  // how much of the budget has been spent (percentage).
  const finalBackgroundColor = backgroundColor || colors.backgroundTertiary;

  // Normalize progress: if > 1.5, assume it's a percentage (0-100), otherwise assume 0-1
  let normalizedProgress = progress;
  if (progress > 1.5) {
    normalizedProgress = progress / 100;
  }

  // Clamp to 0-1 range for display, but allow visualization up to 100%
  const displayProgress = Math.min(1, Math.max(0, normalizedProgress));
  const percentage = Math.round(normalizedProgress * 100);

  // Color thresholds for budget usage (assumptions):
  // Color thresholds updated per request:
  // - percentage < 50 -> success (verde)
  // - percentage == 50 -> warning (anaranjado)
  // - percentage > 50 -> error (rojo)
  // The caller can still pass `color` to override this automatic choice.
  const autoColor =
    percentage < 50
      ? colors.success
      : percentage === 50
        ? colors.warning
        : colors.error;

  const finalColor = color || autoColor;

  return (
    <View>
      <View style={[styles.container, { backgroundColor: finalBackgroundColor, height, borderRadius: height / 2 }]}>
        <View
          style={[
            styles.progress,
            {
              width: `${Math.min(100, displayProgress * 100)}%`,
              backgroundColor: finalColor,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={styles.percentage}>{percentage}%</Text>
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
  percentage: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
});

