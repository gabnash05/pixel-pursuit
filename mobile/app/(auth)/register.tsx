import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Link, router } from 'expo-router';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, isLoading } = useAuth();

    const handleRegister = async () => {
        if (!email.trim() || !password.trim() || !username.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setIsSubmitting(true);
            await register(email, password, username);
        } catch (error: unknown) {
            if (error instanceof Error) {
                Alert.alert('Registration Failed', error.message);
            } else {
                Alert.alert('Registration Failed', 'An unknown error occurred during registration');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 p-6 bg-gray-50 justify-center">
            <View className="mb-8 items-center">
                <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
                <Text className="text-gray-600">Join the Hunt!</Text>
            </View>

            <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Username</Text>
                <TextInput
                    className="bg-white p-4 rounded-lg border border-gray-200"
                    placeholder="Choose a username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
            </View>

            <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
                <TextInput
                    className="bg-white p-4 rounded-lg border border-gray-200"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
                <TextInput
                    className="bg-white p-4 rounded-lg border border-gray-200"
                    placeholder="Create a password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity
                className="bg-indigo-600 p-4 rounded-lg items-center"
                onPress={handleRegister}
                disabled={isSubmitting}
            >
                <Text className="text-white font-medium">
                    {isSubmitting ? 'Registering...' : 'Register'}
                </Text>
            </TouchableOpacity>

            <View className="mt-4 flex-row justify-center">
                <Text className="text-gray-600">Already have an account? </Text>
                <Link href="/login" asChild>
                    <TouchableOpacity>
                        <Text className="text-indigo-600 font-medium">Login</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}