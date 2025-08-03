import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { truncateUsername } from '../../utils/formatText';

interface LeaderboardItemProps {
    item: {
        id: string;
        username: string;
        points: number;
        rank: number;
        isCurrentUser: boolean;
    };
}

export default function LeaderboardItem({ item }: LeaderboardItemProps) {
    return (
        <View 
            className={`flex-row items-center p-3 mx-6 my-1 rounded-lg
                ${item.isCurrentUser ? 'bg-indigo-100 border border-indigo-300' : 'bg-white'}`}
        >
            <View className="w-8 items-center">
                {item.rank <= 3 ? (
                    <View className="w-6 h-6 items-center justify-center">
                        <FontAwesome 
                            name="trophy" 
                            size={20} 
                            color={
                                item.rank === 1 ? Colors.light.warning : 
                                item.rank === 2 ? "#C0C0C0" : "#CD7F32"
                            } 
                        />
                    </View>
                ) : (
                    <Text className={`font-medium ${item.isCurrentUser ? 'text-indigo-700' : 'text-gray-600'}`}>
                        {item.rank}
                    </Text>
                )}
            </View>
            
            <View className="flex-1 ml-4">
                {/* The 'text-center' class is added here to center the text */}
                <Text 
                    className={`text-m font-josefin-medium text-center ${item.isCurrentUser ? 'text-indigo-700' : 'text-gray-800'}`}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {truncateUsername(item.username)}
                    {item.isCurrentUser && ' (You)'}
                </Text>
            </View>
            
            <View className="bg-gray-100 px-3 py-1 rounded-full">
                <Text className="font-josefin-bold text-gray-700">{item.points} pts</Text>
            </View>
        </View>
    );
}