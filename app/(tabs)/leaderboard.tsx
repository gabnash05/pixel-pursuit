import { useState, useEffect } from 'react';
import { View, FlatList, RefreshControl, Text } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import LeaderboardHeader from '../../components/leaderboard/LeaderboardHeader';
import LeaderboardItem from '../../components/leaderboard/LeaderboardItem';
import UserRankCard from '../../components/leaderboard/UserRankCard';
import LoadingSkeleton from '../../components/leaderboard/LoadingSkeleton';
import ErrorState from '../../components/leaderboard/ErrorState';
import { Colors } from '../../constants/colors';
import { useApiClient } from '@/hooks/useApiClient';

type LeaderboardEntry = {
    id: string;
    username: string;
    points: number;
    rank: number;
    isCurrentUser: boolean;
};

export default function LeaderboardScreen() {
    const api = useApiClient();
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchLeaderboard = async () => {
        setError(null);
        try {
            const data = await api.getLeaderboard();
            setLeaderboardData(data.entries);
            setCurrentUserRank(data.currentUserRank);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeaderboard();
    };

    const currentUser = leaderboardData.find(entry => entry.isCurrentUser);

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (error && !refreshing) {
        return <ErrorState onRetry={fetchLeaderboard} />;
    }

    return (
        <View className="flex-1 bg-gray-50">
            {currentUserRank && currentUser && (
                <UserRankCard 
                    rank={currentUserRank} 
                    username={currentUser.username} 
                    points={currentUser.points} 
                />
            )}
            
            <FlatList
                data={leaderboardData}
                renderItem={({ item }) => <LeaderboardItem item={item} />}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={<LeaderboardHeader />}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View className="items-center justify-center p-8">
                        <Text className="text-gray-500">No leaderboard data available</Text>
                    </View>
                }
            />
        </View>
    );
}