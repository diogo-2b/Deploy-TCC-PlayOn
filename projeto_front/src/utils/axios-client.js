import axios from "axios";

const AUTH_TOKEN_KEY = 'auth_token';

export const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || '';

const axiosClient = axios.create({
    baseURL: BASE_URL,
});

axiosClient.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    config.headers.Accept = "application/json";
    try {
        const token = localStorage.getDecryptedItem(AUTH_TOKEN_KEY);
        if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
        
    }
    return config;
});

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status === 401) {
            try {
                localStorage.removeEncryptedItem(AUTH_TOKEN_KEY);
                localStorage.removeEncryptedItem('auth_user');
            } catch (e) {}
            if (typeof window !== 'undefined') window.location.href = '/login';
        }
        throw error;
    }
);

export default axiosClient;
