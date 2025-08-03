// services/api.ts
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
            fetchWithAuth<{ pointsEarned: number }>('POST', '/scans', { qrCode }),

        getProfile: () =>
            fetchWithAuth<{
                username: string;
                totalPoints: number;
                totalScans: number;
                scanPointAverage: number;
                recentScans: {
                    id: string;
                    points: number;
                    timestamp: string;
                }[];
            }>('GET', '/profile'),

        updateProfile: (username: string) =>
            fetchWithAuth('PATCH', '/profile', { username }),

        getLeaderboard: () =>
            fetchWithAuth<{
                entries: {
                    id: string;
                    username: string;
                    points: number;
                    rank: number;
                    isCurrentUser: boolean;
                }[];
                currentUserRank: number;
            }>('GET', `/leaderboard`),

        getScanDetails: (qrCodeId: string) =>
            fetchWithAuth('GET', `/scans/${qrCodeId}`),

        getPoints: () =>
            fetchWithAuth<{ points: number }>('GET', '/user/points'),
    };
};

export type ApiClient = ReturnType<typeof createApiClient>;
