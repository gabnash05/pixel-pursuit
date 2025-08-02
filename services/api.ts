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
            ...(token && { Authorization: `Bearer ${token}` })
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
            fetchWithAuth('POST', '/scans', { qrCode }),

        getProfile: () => fetchWithAuth('GET', '/profile'),

        updateProfile: (username: string) =>
            fetchWithAuth('PATCH', '/profile', { username }),

        getLeaderboard: (timeRange: 'all' | 'weekly' | 'daily') =>
            fetchWithAuth('GET', `/leaderboard?time=${timeRange}`),

        getScanDetails: (qrCodeId: string) =>
            fetchWithAuth('GET', `/scans/${qrCodeId}`),
    };
};

export type ApiClient = ReturnType<typeof createApiClient>;