import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const submitScan = async (req: Request, res: Response) => {
    try {
        const { qrCode } = req.body;

        if (!qrCode || typeof qrCode !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Valid QR code required'
            });
        }

        const userId = req.user;

        const qrCodeRecord = await prisma.qRCodes.findUnique({
            where: { code: qrCode }
        });

        if (!qrCodeRecord) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'QR code not registered in system'
            });
        }

        const existingScan = await prisma.scan.findFirst({
            where: {
                qrCodeId: qrCodeRecord.id,
                userId,
                timestamp: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24-hour cooldown
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

        const pointsEarned = qrCodeRecord.currPoints;
        const pointsToDeduct = calculatePointsReduction(pointsEarned);

        // Create scan + update QR + update User in transaction
        const [newScan] = await prisma.$transaction([
            prisma.scan.create({
                data: {
                    qrCodeString: qrCode,
                    qrCodeId: qrCodeRecord.id,
                    pointsEarned,
                    userId
                },
                select: {
                    id: true,
                    qrCodeString: true,
                    pointsEarned: true,
                    timestamp: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            totalPoints: true
                        }
                    },
                    qrCode: {
                        select: {
                            id: true,
                            code: true,
                            currPoints: true,
                            initialPoints: true
                        }
                    }
                }
            }),

            prisma.qRCodes.update({
                where: { code: qrCode },
                data: {
                    currPoints: {
                        decrement: pointsToDeduct
                    }
                }
            }),

            prisma.user.update({
                where: { id: userId },
                data: {
                    totalPoints: {
                        increment: pointsEarned
                    }
                }
            })
        ]);

        return res.status(201).json({
            message: 'Scan successfully recorded',
            data: {
                scanId: newScan.id,
                pointsEarned: newScan.pointsEarned,
                timestamp: newScan.timestamp,
                remainingPoints: calculateReducedPoints(newScan.qrCode.currPoints + pointsToDeduct)
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

// Point reduction formula
function calculatePointsReduction(basePoints: number): number {
    return Math.max(1, Math.floor(basePoints * 0.1));
}

function calculateReducedPoints(basePoints: number): number {
    return basePoints - calculatePointsReduction(basePoints);
}
