import { View, Text, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { truncateUsername } from '@/utils/formatText';

export default function ProfileHeader({ 
    username, 
    points,
    scansCount 
}: {
    username: string;
    points: number;
    scansCount: number;
}) {
    return (
        <View className="bg-indigo-600 p-6 items-center">
            <View className="bg-white p-1 rounded-full mb-4">
                <View className="w-24 h-24 rounded-full bg-indigo-100 items-center justify-center">
                    <FontAwesome name="user" size={40} color={Colors.primary} />
                </View>
            </View>
            
            <Text className="text-white text-4xl font-josefin-bold mb-1">{truncateUsername(username)}</Text>
            
            <View className="flex-row space-x-6 mt-4 gap-10">
                <View className="items-center">
                    <Text className="text-white text-3xl font-josefin-bold">{points}</Text>
                    <Text className="text-indigo-200 text-md font-josefin-regular">Points</Text>
                </View>
                
                <View className="items-center">
                    <Text className="text-white text-3xl font-josefin-bold">{scansCount}</Text>
                    <Text className="text-indigo-200 text-md font-josefin-regular">Scans</Text>
                </View>
            </View>
        </View>
    );
}