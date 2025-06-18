import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:2000";

export const axiosPublic = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});
