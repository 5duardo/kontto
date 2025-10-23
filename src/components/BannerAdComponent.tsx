import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '@theme';

interface BannerAdComponentProps {
    style?: ViewStyle;
}

/**
 * Componente de anuncio banner
 * Muestra un banner de anuncio en la pantalla
 */
export const BannerAdComponent: React.FC<BannerAdComponentProps> = ({ style }) => {
    const { colors } = useTheme();

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                },
                style,
            ]}
        >
            {/* Aquí irá el componente de anuncio real */}
            {/* Por ahora mostramos un placeholder */}
            <View
                style={[
                    styles.placeholder,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 1,
    },
    placeholder: {
        width: '90%',
        height: 50,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

