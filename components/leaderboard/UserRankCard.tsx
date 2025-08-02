import { View, Text } from 'react-native';

import { truncateUsername } from '@/utils/usernames';

interface UserRankCardProps {
    rank: number;
    username: string;
    points: number;
}

export default function UserRankCard({ rank, username, points }: UserRankCardProps) {
    return (
        <View className="bg-indigo-50 mx-4 my-2 p-4 rounded-lg border border-indigo-100">
            <Text className="text-indigo-800 text-center font-josefin-medium mb-1">Your Position</Text>
            <View className="flex-row justify-center items-center gap-2">
                <Text className="text-4xl font-josefin-bold text-indigo-600 mr-2">{rank}</Text>
                <View>
                    <Text 
                        className="font-josefin-medium text-indigo-800"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >{truncateUsername(username)}</Text>
                    <Text className="text-gray-600 font-josefin-regular">{points} points</Text>
                </View>
            </View>
        </View>
    );
}