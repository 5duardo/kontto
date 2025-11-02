import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';

const { width, height } = Dimensions.get('window');

interface OnboardingSlideProp {
  slide: {
    icon: string;
    title: string;
    description: string;
    color: string;
    content?: React.ReactNode;
  };
}

export const OnboardingSlide: React.FC<OnboardingSlideProp> = ({ slide }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Custom Content */}
        {slide.content && (
          <View style={styles.customContent}>
            {slide.content}
          </View>
        )}

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {slide.title}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {slide.description}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    minHeight: height * 0.85,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  content: {
    alignItems: 'center',
    gap: 24,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customContent: {
    alignItems: 'center',
    width: '100%',
  },
  textContent: {
    gap: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
});

