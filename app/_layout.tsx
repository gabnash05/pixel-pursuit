import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function AuthLayout() {
    const { token, isLoading: authLoading } = useAuth();
    const colorScheme = useColorScheme();

    const [fontsLoaded] = useFonts({
        'JosefinSans-Regular': require('../assets/fonts/JosefinSans-Regular.ttf'),
        'JosefinSans-Bold': require('../assets/fonts/JosefinSans-Bold.ttf'),
        'JosefinSans-Italic': require('../assets/fonts/JosefinSans-Italic.ttf'),
        'JosefinSans-Medium': require('../assets/fonts/JosefinSans-Medium.ttf'),
    });

    const isLoading = !fontsLoaded || authLoading;

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
                {!token ? (
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                ) : (
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                )}
                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <ErrorBoundary>
                <AuthLayout />
            </ErrorBoundary>
        </AuthProvider>
    );
}
