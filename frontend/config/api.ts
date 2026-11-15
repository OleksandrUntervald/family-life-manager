import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const token =
            Cookies.get('access_token') ||
            (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            Cookies.remove('access_token');
            localStorage.removeItem('token');
            if (
                !window.location.pathname.startsWith('/login') &&
                !window.location.pathname.startsWith('/register')
            ) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);