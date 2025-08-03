import type { Scan } from '../scans/scanTypes.js';

export interface User {
    id: string;
    email: string;
    password: string;
    username: string;
    scans: Scan[];
    createdAt: Date;
}