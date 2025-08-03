import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface ErrorStateProps {
    onRetry: () => void;
}

export default function ErrorState({ onRetry }: ErrorStateProps) {
    return (
        <View className="flex-1 items-center justify-center p-6">
            <View className="bg-red-100 p-4 rounded-full mb-4">
                <FontAwesome 
                    name="exclamation-triangle" 
                    size={32} 
                    color={Colors.light.danger} 
                />
            </View>
            <Text className="text-lg font-josefin-medium text-gray-800 mb-2">
                Failed to load leaderboard
            </Text>
            <Text className="text-gray-500 text-center mb-6 font-josefin-regular">
                There was an error fetching the leaderboard data. 
                Please try again.
            </Text>
            <TouchableOpacity
                className="bg-indigo-600 px-6 py-3 rounded-lg"
                onPress={onRetry}
            >
                <Text className="text-white font-josefin-medium">Retry</Text>
            </TouchableOpacity>
        </View>
    );
}