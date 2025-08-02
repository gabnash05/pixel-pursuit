import { View, Text, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

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
            
            <Text className="text-white text-xl font-bold mb-1">{username}</Text>
            
            <View className="flex-row space-x-6 mt-4">
                <View className="items-center">
                    <Text className="text-white text-2xl font-bold">{points}</Text>
                    <Text className="text-indigo-200 text-sm">Points</Text>
                </View>
                
                <View className="items-center">
                    <Text className="text-white text-2xl font-bold">{scansCount}</Text>
                    <Text className="text-indigo-200 text-sm">Scans</Text>
                </View>
            </View>
        </View>
    );
}