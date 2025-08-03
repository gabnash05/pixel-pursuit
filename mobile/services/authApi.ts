import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface AuthData {
    token: string;
    username: string;
}

interface ApiResponse<T> {
    data: T;
    message: string;
}

export const authApi = {
    login: async (email: string, password: string): Promise<ApiResponse<AuthData>> => {
        const response = await axios.post<ApiResponse<AuthData>>(
            `${API_BASE_URL}/auth/login`, 
            { email, password }
        );
        return response.data;
    },

    register: async (email: string, password: string, username: string): Promise<ApiResponse<AuthData>> => {
        const response = await axios.post<ApiResponse<AuthData>>(
            `${API_BASE_URL}/auth/register`,
            { email, password, username }
        );
        return response.data;
    }
};