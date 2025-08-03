import { View, Text } from 'react-native';

export default function LeaderboardHeader() {
    return (
        <View className="flex-row justify-between mx-10 my-2">
            <Text className="text-gray-500 font-josefin-bold">Rank</Text>
            <Text className="text-gray-500 font-josefin-bold">Player</Text>
            <Text className="text-gray-500 font-josefin-bold">Points</Text>
        </View>
    );
}