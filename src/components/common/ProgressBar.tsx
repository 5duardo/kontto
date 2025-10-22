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
  const finalColor = color || colors.primary;
  const finalBackgroundColor = backgroundColor || colors.backgroundTertiary;

  // Normalize progress: if > 1.5, assume it's a percentage (0-100), otherwise assume 0-1
  let normalizedProgress = progress;
  if (progress > 1.5) {
    normalizedProgress = progress / 100;
  }

  // Clamp to 0-1 range for display, but allow visualization up to 100%
  const displayProgress = Math.min(1, Math.max(0, normalizedProgress));
  const percentage = Math.round(normalizedProgress * 100);

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
