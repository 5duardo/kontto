import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { accentColorMap } from '../theme/colorSchemes';

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
  const [progress] = useState(new Animated.Value(0));

  // Mapear el nombre del acento al color hexadecimal; fallback a colors.primary
  const accentHex = accentColorMap[accent] ?? colors.primary;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 100,
      duration: duration,
      useNativeDriver: false,
    }).start(() => {
      onComplete?.();
    });
  }, [progress, duration, onComplete]);

  const progressValue = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Solo mostrar la barra de progreso centrada, sin texto ni icono */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressValue,
              backgroundColor: accentHex,
            },
          ]}
        />
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
