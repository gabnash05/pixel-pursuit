import type { User } from '../users/userTypes.js';

export interface Scan {
    id: string;
    qrCode: string;
    qrCodeId: string;
    pointsEarned: number;
    timestamp: Date;
    userId: string;
    user: User;
}