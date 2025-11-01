import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface DotLoaderProps {
    size?: number;
    color?: string;
    gap?: number;
    style?: ViewStyle;
}

export const DotLoader: React.FC<DotLoaderProps> = ({
    size = 16,
    color,
    gap = 12,
    style,
}) => {
    const { colors } = useTheme();
    const dotColor = color ?? colors.primary;

    // values used for both opacity and scale (more visible)
    const op1 = useRef(new Animated.Value(0.6)).current;
    const op2 = useRef(new Animated.Value(0.6)).current;
    const op3 = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        const createPulse = (animated: Animated.Value) =>
            Animated.sequence([
                Animated.timing(animated, { toValue: 1, duration: 360, useNativeDriver: true }),
                Animated.timing(animated, { toValue: 0.6, duration: 360, useNativeDriver: true }),
            ]);

        const animation = Animated.loop(
            Animated.stagger(160, [createPulse(op1), createPulse(op2), createPulse(op3)])
        );

        animation.start();
        return () => animation.stop();
    }, [op1, op2, op3]);

    return (
        <View
            accessible
            accessibilityLabel="Cargando"
            accessibilityRole="progressbar"
            accessibilityLiveRegion="polite"
            style={[styles.container, style]}
        >
            <Animated.View
                style={[
                    styles.dot,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        marginRight: gap,
                        backgroundColor: dotColor,
                        opacity: op1,
                        transform: [
                            {
                                scale: op1.interpolate({ inputRange: [0.6, 1], outputRange: [0.9, 1.18] }),
                            },
                        ],
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.dot,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        marginRight: gap,
                        backgroundColor: dotColor,
                        opacity: op2,
                        transform: [
                            {
                                scale: op2.interpolate({ inputRange: [0.6, 1], outputRange: [0.9, 1.18] }),
                            },
                        ],
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.dot,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: dotColor,
                        opacity: op3,
                        transform: [
                            {
                                scale: op3.interpolate({ inputRange: [0.6, 1], outputRange: [0.9, 1.18] }),
                            },
                        ],
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        // width/height set inline
    },
});

export default DotLoader;
