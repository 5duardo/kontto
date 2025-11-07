import React, { ReactNode } from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet } from 'react-native';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: string | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('💥 ErrorBoundary caught:', error);
        console.error('Stack:', errorInfo.componentStack);

        this.setState({
            error,
            errorInfo: errorInfo.componentStack,
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <SafeAreaView style={styles.container}>
                    <ScrollView style={styles.content}>
                        <Text style={styles.title}>⚠️ Error Detected</Text>
                        <Text style={styles.message}>{this.state.error?.message}</Text>
                        <Text style={styles.stack}>{this.state.errorInfo}</Text>
                    </ScrollView>
                </SafeAreaView>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1117',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#EF4444',
        marginBottom: 12,
    },
    message: {
        fontSize: 14,
        color: '#E5E7EB',
        marginBottom: 12,
    },
    stack: {
        fontSize: 12,
        color: '#9CA3AF',
        fontFamily: 'Courier New',
        backgroundColor: '#1F2937',
        padding: 12,
        borderRadius: 8,
    },
});
