import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

// Define the structure for the user object
interface User {
    username: string;
}

// Define the new AuthContext type
interface AuthContextType {
    token: string | null;
    user: User | null; // Added user object
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    user: null, // Initial value for user
    isLoading: true,
    login: async () => {},
    register: async () => {},
    logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null); // New state for user
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAuthData = async () => {
            try {
                // Get both token and user data from SecureStore
                const storedAuthData = await SecureStore.getItemAsync('authData');
                if (storedAuthData) {
                    const data = JSON.parse(storedAuthData);
                    setToken(data.token);
                    setUser(data.user);
                    // Redirect to home if auth data exists
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

    const login = async (email: string, password: string) => {
        try {
            // TODO: Replace with actual API call
            const response = await fetch('YOUR_API_URL/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                const authData = {
                    token: data.token,
                    user: { username: data.username }, // Assuming API returns 'username'
                };
                
                await SecureStore.setItemAsync('authData', JSON.stringify(authData));
                setToken(authData.token);
                setUser(authData.user);
                router.replace('/(tabs)');
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (email: string, password: string, username: string) => {
        try {
            // TODO: Replace with actual API call
            const response = await fetch('YOUR_API_URL/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, username }),
            });

            const data = await response.json();

            if (response.ok) {
                 const authData = {
                    token: data.token,
                    user: { username: data.username }, // Assuming API returns 'username'
                };

                await SecureStore.setItemAsync('authData', JSON.stringify(authData));
                setToken(authData.token);
                setUser(authData.user);
                router.replace('/(tabs)');
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync('authData'); // Delete the single auth data key
            setToken(null);
            setUser(null); // Clear the user state
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};