import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator , Text} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import ProfileHeader from '../../components/profile/ProfileHeader';
import StatsCard from '../../components/profile/StatsCard';
import ScanHistoryItem from '../../components/profile/ScanHistoryItem';
import { Colors } from '../../constants/colors';
import { useApiClient } from '@/hooks/useApiClient';
import { truncateUsername } from '@/utils/formatText';

type ScanHistory = {
    id: string;
    points: number;
    timestamp: string;
    location?: string;
};

type UserStats = {
    username: string;
    totalPoints: number;
    totalScans: number;
    scanPointAverage: number;
    recentScans: ScanHistory[];
};

export default function ProfileScreen() {
    const { logout } = useAuth();
    const api = useApiClient();

    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfileData = async () => {
        setError(null);
        setIsLoading(true);

        try {
            const data = await api.getProfile();
            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 p-6 ">
                <View className="bg-red-100 p-4 rounded-full mb-4">
                    <FontAwesome name="exclamation-triangle" size={32} color={Colors.light.danger} />
                </View>
                <Text className="text-lg font-josefin-medium text-gray-800 mb-2">Error loading profile</Text>
                <Text className="text-gray-500 text-center mb-6 font-josefin-regular">{error}</Text>
                <TouchableOpacity
                    className="bg-indigo-600 px-6 py-3 rounded-lg"
                    onPress={fetchProfileData}
                >
                    <Text className="text-white font-josefin-medium">Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {stats && (
                <>
                    <ProfileHeader 
                        username={truncateUsername(stats.username)}
                        points={stats.totalPoints}
                        scansCount={stats.totalScans}
                    />
                    
                    <View className="p-4">
                        <View className="mb-6">
                            <Text className="text-lg font-josefin-bold text-gray-800 mb-3">Your Stats</Text>
                            
                            <StatsCard 
                                title="Scan Point Average" 
                                value={stats.scanPointAverage}
                                icon={
                                    <FontAwesome 
                                        name="line-chart" 
                                        size={24} 
                                        color={Colors.primary} 
                                    />
                                }
                            />
                        </View>
                        
                        <View className="mb-6">
                            <Text className="text-lg font-josefin-bold text-gray-800 mb-3">Recent Scans</Text>
                            
                            {stats.recentScans.length > 0 ? (
                                stats.recentScans.map((scan) => (
                                    <ScanHistoryItem
                                        key={scan.id}
                                        points={scan.points}
                                        timestamp={scan.timestamp}
                                    />
                                ))
                            ) : (
                                <View className="bg-white p-6 rounded-lg items-center">
                                    <Text className="text-gray-500">No scan history yet</Text>
                                </View>
                            )}
                        </View>
                        
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-red-50 p-4 rounded-lg border border-red-100"
                            onPress={handleLogout}
                        >
                            <FontAwesome 
                                name="sign-out" 
                                size={20} 
                                color={Colors.light.danger} 
                            />
                            <Text className="text-red-600 font-josefin-medium ml-2">Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </ScrollView>
    );
}