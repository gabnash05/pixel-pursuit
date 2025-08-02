import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

export default function ScanHistoryItem({ 
    points,
    timestamp,
    location 
}: {
    points: number;
    timestamp: string;
    location?: string;
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
                <Text className="font-medium text-gray-800">
                    +{points} points
                </Text>
                <Text className="text-gray-500 text-sm">
                    {timestamp}
                </Text>
                {location && (
                    <Text className="text-gray-500 text-sm mt-1">
                        <FontAwesome name="map-marker" size={12} /> {location}
                    </Text>
                )}
            </View>
            
            <FontAwesome 
                name="chevron-right" 
                size={16} 
                color={Colors.primary} 
            />
        </View>
    );
}