import type { User } from '../users/userTypes.js';

export interface Scan {
    id: string;
    qrCodeString: string;
    qrCodeId: string;
    pointsEarned: number;
    timestamp: Date;
    userId: string;
    user?: User;
    qrCode?: QRCodes;
}

export interface QRCodes {
    id: string;
    code: string;
    initialPoints: number;
    currPoints: number;
    createdAt: Date;
    updatedAt: Date;
    scans?: Scan[];
}