export interface Chat {
    name: string;
    messages: Message[];
    chatId: string;
}

export interface JoinedChat {
    name: string;
    messages: Message[];
    chatId: string;
    isNotificationOn: boolean;
}

export interface Message {
    username: string;
    avatar: number;
    text: string;
    timeStamp: string;
    isUsersMessage: boolean;
    textColor: string;
}