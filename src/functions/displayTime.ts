export const displayTime = (time: string): string => {
    const now = new Date();
    const sentAt = new Date(time);
    const diff = now.getTime() - sentAt.getTime();

    if (diff > 86400000) {
        const days = Math.floor(diff / 86400000);
        return days === 1 ? "yesterday" : `${days} days ago`;
    }
    if (diff > 3600000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    if (diff > 60000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }
    return "just now";
};