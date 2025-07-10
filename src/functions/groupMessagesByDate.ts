import type { IMessage } from "../interfaces/chat/IChat";

export const groupMessagesByDate = (messages: IMessage[]) => {
    const groups: { [key: string]: IMessage[] } = {};

    messages.forEach((msg) => {
        const date = new Date(msg.sentAt || "");
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let groupKey: string;

        if (date.toDateString() === today.toDateString()) {
            groupKey = "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            groupKey = "Yesterday";
        } else {
            groupKey = date.toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        }

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(msg);
    });

    return groups;
};