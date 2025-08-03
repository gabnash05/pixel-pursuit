import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import * as Updates from 'expo-updates';

type ErrorBoundaryState = {
    hasError: boolean;
    error: Error | null;
};

type Props = React.PropsWithChildren<{}>;

export default class ErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
        hasError: false,
        error: null,
    };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // Log error details to monitoring service or console
        console.error('ErrorBoundary caught an error:', error, info);
    }

    onReset = async () => {
        // Option 1: Just reset the state and try rendering again
        this.setState({ hasError: false, error: null });

        // Option 2: Uncomment below to hard reload the entire app using Expo
        // try {
        //     await Updates.reloadAsync();
        // } catch (reloadError) {
        //     console.error("Failed to reload app:", reloadError);
        // }
    };

    render() {
        if (this.state.hasError) {
            return (
                <View className="flex-1 items-center justify-center p-6 bg-white">
                    <FontAwesome
                        name="exclamation-circle"
                        size={48}
                        color={Colors.light.danger}
                    />
                    <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">
                        Something went wrong
                    </Text>
                    <Text className="text-gray-500 text-center mb-6">
                        {this.state.error?.message || 'Unexpected error occurred.'}
                    </Text>
                    <TouchableOpacity
                        className="bg-indigo-600 px-6 py-3 rounded-lg"
                        onPress={this.onReset}
                    >
                        <Text className="text-white font-medium">Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}
