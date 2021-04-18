export interface Chat {
    name: string;
    messages: Message[];
    chatId: string;
    isGameChat: boolean;
}

export interface JoinedChat {
    name: string;
    messages: Message[];
    chatId: string;
    isNotificationOn: boolean;
    isChatHistoryDisplayed: boolean;
    isGameChat: boolean;
}

export interface Message {
    username: string;
    avatar: number;
    text: string;
    timestamp: string;
    isUsersMessage: boolean;
    textColor: string;
}