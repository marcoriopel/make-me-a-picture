export interface Chat {
    name: string;
    messages: Message[];
    chatId: string;
}

export interface Message {
    username: string;
    avatar: number;
    text: string;
    timeStamp: string;
    isUsersMessage: boolean;
    textColor: string;
}