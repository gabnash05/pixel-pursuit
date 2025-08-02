import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <View className="flex-1 items-center justify-center p-5 bg-white">
                <Text className="text-2xl font-bold text-gray-800">This screen does not exist.</Text>
                <Link href="/" asChild>
                    <Text className="mt-4 py-3 text-indigo-600 font-medium">Go to home screen!</Text>
                </Link>
            </View>
        </>
    );
}
