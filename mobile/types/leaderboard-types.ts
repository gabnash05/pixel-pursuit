export type LeaderboardEntry = {
    id: string;
    username: string;
    points: number;
    rank: number;
    isCurrentUser: boolean;
};

export type LeaderboardResponse = {
    entries: LeaderboardEntry[];
    currentUserRank: number;
};