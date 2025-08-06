import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type { LeaderboardResponse } from '../types/leaderboard/leaderboardTypes.js';
import type { User } from '../types/users/userTypes.js';

const prisma = new PrismaClient();

export const getLeaderboard = async (req: Request, res: Response<LeaderboardResponse>) => {
    try {
        // 1. Get current user ID from auth (assuming it's in req.user)
        const currentUserId = req.user?.userId;

        // 2. Fetch all users with their scans
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                scans: { 
                    select: { 
                        pointsEarned: true 
                    } 
                },
            },
        });

        // 3. Calculate points and create entries
        const entriesWithPoints = users.map((user: User) => ({
            id: user.id,
            username: user.username,
            points: user.scans.reduce((acc, scan) => acc + scan.pointsEarned, 0),
            isCurrentUser: user.id === currentUserId,
        }));

        // 4. Sort by points descending
        const sortedEntries = [...entriesWithPoints].sort((a, b) => b.points - a.points);

        // 5. Add ranks
        const rankedEntries = sortedEntries.map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));

        // 6. Find current user's rank
        const currentUserRank = rankedEntries.find(entry => entry.isCurrentUser)?.rank || 0;

        // 7. Get top 10 (or all if less than 10)
        const topEntries = rankedEntries.slice(0, 10);

        // 8. Send response
        res.json({
            entries: topEntries,
            currentUserRank,
        });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            entries: [],
            currentUserRank: 0,
        });
    }
};