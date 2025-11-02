import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../../theme';

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: number;
  backgroundColor?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  icon,
  color,
  size = 24,
  backgroundColor,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor || `${color}20`,
          width: size * 1.8,
          height: size * 1.8,
        },
      ]}
    >
      <Ionicons name={icon as any} size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

