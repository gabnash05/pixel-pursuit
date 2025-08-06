import type { Scan } from '../scans/scanTypes.js';

export interface User {
    id: string;
    email: string;
    password: string;
    username: string;
    isAdmin: boolean;
    totalPoints: number;
    scans: Scan[];
    createdAt: Date;
    updatedAt: Date;
}