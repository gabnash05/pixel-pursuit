// services/api.ts
import { LeaderboardEntry, LeaderboardResponse } from '@/types/leaderboard-types';
import { QRCodes, Scan, User } from '@/types/user-types';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface ApiResponse<T> {
    data: T;
    message: string;
}

export const createApiClient = (token?: string) => {
    const api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    const fetchWithAuth = async <T = any>(
        method: 'GET' | 'POST' | 'PATCH',
        url: string,
        data?: any
    ): Promise<T> => {
        try {
            console.log(method, url, data)
            console.log(token)
            const response = await api.request<ApiResponse<T>>({
                method,
                url,
                data,
            });
            return response.data.data;
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'API request failed';
            throw new Error(message);
        }
    };

    return {
        submitScan: (qrCode: string) =>
            fetchWithAuth<{
                scanId: string;
                pointsEarned: number;
                timestamp: Date;
                remainingPoints: number;
            }>('POST', '/scan', { qrCode }),

        getLeaderboard: () =>
            fetchWithAuth<LeaderboardResponse>('GET', `/leaderboard`),

        getProfile: () =>
            fetchWithAuth('GET', '/profile'),

        getPoints: () => 
            fetchWithAuth('GET', '/profile/points')
    }
};

export type ApiClient = ReturnType<typeof createApiClient>;
