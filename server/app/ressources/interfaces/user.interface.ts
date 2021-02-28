export interface AuthInfo {
    username: string;
    password: string;
}

export interface BasicUser {
    username: string;
    avatar: number;
}

export interface DetailedUser {
    surname: string;
    name: string;
    username: string;
    password: string;
    avatar: number;
}