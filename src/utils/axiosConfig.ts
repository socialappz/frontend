import axios from "axios";

// Use explicit API URL when provided; otherwise default to same-origin in production
// and only fall back to localhost during local development.
const isBrowser = typeof window !== "undefined";
const isLocalhost = isBrowser && window.location.hostname === "localhost";
const baseURL = import.meta.env.VITE_API_URL || (isLocalhost ? "http://localhost:2000" : "");

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
