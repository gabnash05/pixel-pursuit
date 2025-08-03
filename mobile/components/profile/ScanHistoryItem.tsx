import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { formatDateAndTime } from '@/utils/formatText';

export default function ScanHistoryItem({ 
    points,
    timestamp,
}: {
    points: number;
    timestamp: string;
}) {
    return (
        <View className="flex-row items-center p-4 bg-white rounded-lg mb-2">
            <View className="bg-indigo-100 p-3 rounded-full mr-4">
                <FontAwesome 
                    name="qrcode" 
                    size={20} 
                    color={Colors.primary} 
                />
            </View>
            
            <View className="flex-1">
                <Text className="font-josefin-medium text-gray-800">
                    +{points} points
                </Text>
                <Text className="text-gray-500 text-sm font-josefin-regular">
                    {formatDateAndTime(timestamp)}
                </Text>
            </View>
        </View>
    );
}