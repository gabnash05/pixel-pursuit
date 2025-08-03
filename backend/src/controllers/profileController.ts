import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type { User } from '../types/users/userTypes.js';

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ 
                error: 'Unauthorized',
                message: 'User ID not found in request' 
            });
        }

        const user: User | null = await prisma.user.findUnique({
            where: { 
                id: req.user.userId 
            },
            include: { 
                scans: {
                    select: {
                        id: true,
                        points: true,
                        timestamp: true,
                        location: true
                    },
                    orderBy: {
                        timestamp: 'desc'
                    }
                } 
            },
        });

        if (!user) {
            return res.status(404).json({ 
                error: 'Not Found',
                message: 'User not found in database' 
            });
        }

        const totalPoints = user.scans.reduce(
            (sum, scan) => sum + scan.points, 
            0
        );

        const averagePoints = user.scans.length > 0 
            ? totalPoints / user.scans.length 
            : 0;

        return res.status(200).json({
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                stats: {
                    totalPoints,
                    totalScans: user.scans.length,
                    averagePoints: parseFloat(averagePoints.toFixed(2))
                },
                recentScans: user.scans
            }
        });

    } catch (error) {
        console.error('Profile Controller Error:', error);
        
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve profile data',
            details: process.env.NODE_ENV === 'development' 
                ? (error instanceof Error ? error.message : String(error))
                : undefined
        });
    }
};