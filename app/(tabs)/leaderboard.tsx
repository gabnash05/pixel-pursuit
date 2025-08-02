import { useState, useEffect } from 'react';
import { View, FlatList, RefreshControl, Text } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import LeaderboardHeader from '../../components/leaderboard/LeaderboardHeader';
import LeaderboardItem from '../../components/leaderboard/LeaderboardItem';
import UserRankCard from '../../components/leaderboard/UserRankCard';
import LoadingSkeleton from '../../components/leaderboard/LoadingSkeleton';
import ErrorState from '../../components/leaderboard/ErrorState';
import { Colors } from '../../constants/colors';

type LeaderboardEntry = {
    id: string;
    username: string;
    points: number;
    rank: number;
    isCurrentUser: boolean;
};

export default function LeaderboardScreen() {
    const { token } = useAuth();
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchLeaderboard = async () => {
        setError(null);
        try {
            // TODO: Replace with actual API call
            // const response = await fetch(`YOUR_API_URL/leaderboard`, {
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //     },
            // });
            // const data = await response.json();

            // if (response.ok) {
            //     setLeaderboardData(data.entries);
            //     setCurrentUserRank(data.currentUserRank);
            // } else {
            //     throw new Error(data.message || 'Failed to fetch leaderboard');
            // }

            const data = {
                entries: [
                    { id: '1', username: 'Alex', points: 100, rank: 1, isCurrentUser: false },
                    { id: '2', username: 'Steve', points: 90, rank: 2, isCurrentUser: false },
                    { id: '3', username: 'Dave', points: 80, rank: 3, isCurrentUser: true },
                    { id: '4', username: 'John', points: 70, rank: 4, isCurrentUser: false },
                    { id: '5', username: 'Jane', points: 60, rank: 5, isCurrentUser: false },
                    { id: '6', username: 'Alice', points: 50, rank: 6, isCurrentUser: false },
                    { id: '7', username: 'Bob', points: 40, rank: 7, isCurrentUser: false },
                    { id: '8', username: 'Charlie', points: 30, rank: 8, isCurrentUser: false },
                ],
                currentUserRank: 3,
            };

            setLeaderboardData(data.entries);
            setCurrentUserRank(data.currentUserRank);

        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error fetching leaderboard:', error.message);
            } else {
                console.error('Unexpected error fetching leaderboard:', error);
            }
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