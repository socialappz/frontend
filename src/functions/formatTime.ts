import type { ReactNode } from "react";

export const formatTime = (timestamp?: string): ReactNode | string => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();
    if (isToday) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    const isSameYear = date.getFullYear() === now.getFullYear();

    return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: isSameYear ? undefined : "numeric",
    });
};