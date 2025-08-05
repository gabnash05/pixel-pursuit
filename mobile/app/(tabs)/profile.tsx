import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { createApiClient } from '../../services/api';
import { Colors } from '../../constants/colors';
import ProfileHeader from '../../components/profile/ProfileHeader';
import StatsCard from '../../components/profile/StatsCard';
import ScanHistoryItem from '../../components/profile/ScanHistoryItem';
import ErrorState from '../../components/profile/ErrorState';
import { truncateUsername } from '../../utils/formatText';

const api = createApiClient();

type ScanHistory = {
    id: string;
    pointsEarned: number;
    timestamp: string;
    qrCode: string;
};

type UserStats = {
    username: string;
    stats: {
        totalPoints: number;
        totalScans: number;
        averagePoints: number;
    };
    recentScans: ScanHistory[];
};

export default function ProfileScreen() {
    const { logout } = useAuth();
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
        return <ErrorState onRetry={fetchProfileData} />;
    }

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {stats && (
                <>
                    <ProfileHeader 
                        username={truncateUsername(stats.username)}
                        points={stats.stats.totalPoints}
                        scansCount={stats.stats.totalScans}
                    />
                    
                    <View className="p-4">
                        <View className="mb-6">
                            <Text className="text-lg font-josefin-bold text-gray-800 mb-3">Your Stats</Text>
                            
                            <StatsCard 
                                title="Scan Point Average" 
                                value={stats.stats.averagePoints}
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
                                        points={scan.pointsEarned}
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