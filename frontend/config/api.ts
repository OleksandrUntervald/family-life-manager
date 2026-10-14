import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
    // Беремо URL з нашого docker-compose.yml
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

// Інтерцептор автоматично додаватиме JWT-токен до кожного запиту, якщо він є
api.interceptors.request.use((config) => {
    const token = Cookies.get('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});