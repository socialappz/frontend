import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:2000";

export const axiosPublic = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request-Interceptor für automatische Token-Einbindung
axiosPublic.interceptors.request.use(
    (config) => {
        // Token aus Cookie extrahieren
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const trimmed = cookie.trim();
            if (trimmed.startsWith('token=')) {
                const token = trimmed.substring(6);
                config.headers.Authorization = `Bearer ${token}`;
                break;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
