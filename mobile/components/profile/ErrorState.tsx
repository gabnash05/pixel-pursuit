import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface ErrorStateProps {
    onRetry: () => void;
    message?: string;
    description?: string;
}

export default function ErrorState({ 
    onRetry, 
    message = "Failed to load profile",
    description = "There was an error fetching your profile data. Please try again."
}: ErrorStateProps) {
    return (
        <View className="flex-1 items-center justify-center p-6 bg-gray-50">
            <View className="bg-red-100 p-4 rounded-full mb-4">
                <FontAwesome 
                    name="exclamation-triangle" 
                    size={32} 
                    color={Colors.light.danger} 
                />
            </View>
            <Text className="text-lg font-josefin-medium text-gray-800 mb-2">
                {message}
            </Text>
            <Text className="text-gray-500 text-center mb-6 font-josefin-regular">
                {description}
            </Text>
            <TouchableOpacity
                className="bg-indigo-600 px-6 py-3 rounded-lg"
                onPress={onRetry}
            >
                <Text className="text-white font-josefin-medium">Try Again</Text>
            </TouchableOpacity>
        </View>
    );
}