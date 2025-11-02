import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { accentColorMap } from '../theme/colorSchemes';
import DotLoader from './common/DotLoader';

interface LoadingScreenProps {
  duration?: number; // Duración en ms
  onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  duration = 2000,
  onComplete,
}) => {
  const { colors } = useTheme();
  const accent = useAppStore((s) => s.accentColor);

  // Mapear el nombre del acento al color hexadecimal; fallback a colors.primary
  const accentHex = accentColorMap[accent] ?? colors.primary;

  useEffect(() => {
    const t = setTimeout(() => onComplete?.(), duration);
    return () => clearTimeout(t);
  }, [duration, onComplete]);

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.content}>
        <DotLoader size={16} color={accentHex} gap={12} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  textContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressContainer: {
    width: 200,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});

