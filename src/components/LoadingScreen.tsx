import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';

interface LoadingScreenProps {
  duration?: number; // Duración en ms
  onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  duration = 300,
  onComplete,
}) => {
  const { colors } = useTheme();
  const [progress] = useState(new Animated.Value(0));

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
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.content}>
        {/* Icono animado */}
        <MaterialCommunityIcons
          name="wallet-outline"
          size={80}
          color={colors.primary}
          style={styles.icon}
        />

        {/* Texto */}
        <View style={styles.textContainer}>
          <Animated.Text
            style={[
              styles.title,
              { color: colors.textPrimary },
            ]}
          >
            Kontto
          </Animated.Text>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressValue,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
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
