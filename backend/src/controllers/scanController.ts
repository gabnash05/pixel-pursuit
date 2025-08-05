import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const submitScan = async (req: Request, res: Response) => {
    try {
        // Validate request
        if (!req.user?.userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }

        const { qrCode } = req.body;

        if (!qrCode || typeof qrCode !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Valid QR code required'
            });
        }

        // Get QR code record first to check if it exists and get its ID
        const qrCodeRecord = await prisma.qRCodes.findUnique({
            where: { code: qrCode }
        });

        if (!qrCodeRecord) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'QR code not registered in system'
            });
        }

        // Check for duplicate scans using qrCodeId
        const existingScan = await prisma.scan.findFirst({
            where: { 
                qrCodeId: qrCodeRecord.id, 
                userId: req.user.userId,
                timestamp: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within 24 hours
                }
            }
        });

        if (existingScan) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'QR code already scanned recently',
                details: {
                    lastScanned: existingScan.timestamp,
                    cooldownRemaining: '24 hours'
                }
            });
        }

        // Calculate points with reduction formula
        const pointsEarned = qrCodeRecord.currPoints;

        // Start transaction to ensure data consistency
        const [newScan] = await prisma.$transaction([
            prisma.scan.create({
                data: { 
                    qrCode, 
                    qrCodeId: qrCodeRecord.id,
                    pointsEarned, 
                    userId: req.user.userId 
                },
                select: {
                    id: true,
                    pointsEarned: true,
                    timestamp: true,
                    qrCode: true
                }
            }),
            
            // Update QR code's current points
            prisma.qRCodes.update({
                where: { code: qrCode },
                data: {
                    currPoints: {
                        decrement: calculatePointsReduction(pointsEarned)
                    }
                }
            }),
            
            // Update user's total points
            prisma.user.update({
                where: { id: req.user.userId },
                data: {
                    totalPoints: {
                        increment: pointsEarned
                    }
                }
            })
        ]);

        return res.status(201).json({
            data: {
                // TODO: Update this in frontend
                message: 'Scan successfully recorded',
                pointsEarned: newScan.pointsEarned,
                scanId: newScan.id,
                timestamp: newScan.timestamp,
                remainingPoints: qrCodeRecord.currPoints - calculatePointsReduction(pointsEarned)
            }
        });

    } catch (error) {
        console.error('Scan Submission Error:', error);
        
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to process scan',
            details: process.env.NODE_ENV === 'development' 
                ? (error instanceof Error ? error.message : String(error))
                : undefined
        });
    }
};

// Point reduction formula (e.g., reduce by 10% each scan)
function calculatePointsReduction(basePoints: number): number {
    return Math.max(1, Math.floor(basePoints * 0.1)); // Never reduces below 1 point
}

// Final points calculation with optional modifiers
function calculateReducedPoints(basePoints: number, qrCode: string): number {
    const reducedPoints = basePoints - calculatePointsReduction(basePoints);
    // Apply any additional modifiers
    return qrCode.startsWith('PREMIUM_') 
        ? Math.floor(reducedPoints * 1.5) // 50% bonus for premium codes
        : reducedPoints;
}