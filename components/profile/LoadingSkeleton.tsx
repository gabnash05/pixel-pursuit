import { View } from 'react-native';

export default function LoadingSkeleton() {
    return (
        <View className="p-4">
            {[...Array(5)].map((_, i) => (
                <View 
                    key={i} 
                    className="flex-row items-center p-4 mx-4 my-1 rounded-lg bg-gray-100"
                >
                    <View className="w-8 h-8 rounded-full bg-gray-200" />
                    <View className="flex-1 ml-4">
                        <View className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <View className="h-3 bg-gray-200 rounded w-1/2" />
                    </View>
                    <View className="w-16 h-6 bg-gray-200 rounded-full" />
                </View>
            ))}
        </View>
    );
}