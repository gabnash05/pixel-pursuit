import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';

export default function PointsDisplay({ points }: { points: number }) {
    return (
        <View className="absolute top-10 left-0 right-0 z-10">
            <View className="bg-indigo-600 mx-6 p-4 rounded-lg shadow-lg">
                <Text className="text-white text-center text-2xl font-josefin-bold">Your Points</Text>
                <Text className="text-white text-center text-3xl font-josefin-bold">
                    {points}
                </Text>
            </View>
        </View>
    );
}