export interface User {
    id: string;
    email: string;
    password: string;
    username: string;
    isAdmin: boolean;
    totalPoints: number;
    scans?: Scan[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Scan {
    id: string;
    qrCodeString: string;
    qrCodeId: string;
    pointsEarned: number;
    timestamp: string;
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