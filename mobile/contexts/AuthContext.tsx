import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { authApi } from '../services/authApi';

interface User {
    username: string;
}

interface AuthData {
    token: string;
    user: User;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    user: null,
    isLoading: true,
    login: async () => {},
    register: async () => {},
    logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [authData, setAuthData] = useState<AuthData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const storedAuthData = await SecureStore.getItemAsync('authData');
                if (storedAuthData) {
                    const data = JSON.parse(storedAuthData) as AuthData;
                    setAuthData(data);
                    router.replace('/(tabs)');
                }
            } catch (error) {
                console.error('Failed to load auth data', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAuthData();
    }, []);

    const persistAuthData = async (data: AuthData) => {
        await SecureStore.setItemAsync('authData', JSON.stringify(data));
        setAuthData(data);
    };

    const clearAuthData = async () => {
        await SecureStore.deleteItemAsync('authData');
        setAuthData(null);
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await authApi.login(email, password);
            const newAuthData = {
                token: response.data.token,
                user: { username: response.data.user.username },
            };
            await persistAuthData(newAuthData);
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (email: string, password: string, username: string) => {
        try {
            const response = await authApi.register(email, password, username);
            const newAuthData = {
                token: response.data.token,
                user: { username: response.data.user.username },
            };
            await persistAuthData(newAuthData);
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await clearAuthData();
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{
            token: authData?.token || null,
            user: authData?.user || null,
            isLoading,
            login,
            register,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};