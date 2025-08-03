import { createApiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useApiClient = () => {
    const { token } = useAuth();
    return createApiClient(token || undefined);
};