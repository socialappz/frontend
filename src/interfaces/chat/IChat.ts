export interface IMessage {
    msg: string;
    sentBy: string;
    sentAt?: string;
}

export interface IChat {
    roomId: string;
    chat: IMessage[];
    sentAt: string;
} 