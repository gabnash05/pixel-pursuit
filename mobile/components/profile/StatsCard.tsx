import { View, Text } from 'react-native';

export default function StatsCard({ 
    title, 
    value,
    icon 
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}) {
    return (
        <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <View className="flex-row items-center justify-between">
                <View>
                    <Text className="text-gray-500 text-md font-josefin-regular">{title}</Text>
                    <Text className="text-gray-800 text-2xl font-josefin-bold">{value}</Text>
                </View>
                {icon}
            </View>
        </View>
    );
}