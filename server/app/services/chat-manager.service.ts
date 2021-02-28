import { IncomingMessage } from '@app/ressources/interfaces/incoming-message.interface';
import * as socketio from "socket.io";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { UserCredentialsModel } from '@app/models/user-credentials.model';
import { ChatModel } from '@app/models/chat.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { BasicUser } from '@app/ressources/interfaces/user.interface';

@injectable()
export class ChatManagerService {
    socket: socketio.Server;

    constructor(
        @inject(TYPES.UserCredentialsModel) private userCredentialsModel: UserCredentialsModel,
        @inject(TYPES.ChatModel) private chatModel: ChatModel,
    ) {
    }

    setSocket(io: socketio.Server) {
        this.socket = io;
    }

    dispatchMessage(user: BasicUser, message: IncomingMessage, date: Date) {
        let tmpHour: number = date.getHours() + (date.getTimezoneOffset() / 60) - 5;
        if (tmpHour < 0) { tmpHour += 24 }
        let hours: string = tmpHour.toString().length == 1 ? "0" + tmpHour.toString() : tmpHour.toString();
        let minutes: string = date.getMinutes().toString().length == 1 ? "0" + date.getMinutes().toString() : date.getMinutes().toString();
        let seconds: string = date.getSeconds().toString().length == 1 ? "0" + date.getSeconds().toString() : date.getSeconds().toString();
        let timeStamp: string = hours + ":" + minutes + ":" + seconds;
        this.socket.emit('message', { "user": user, "text": message.text, "timeStamp": timeStamp, "textColor": "#000000" });
    }

    async getAllChatHistory(username: string, res: Response, next: NextFunction) {
        var chatsHistory = [];
        if (!username) {
            return res.sendStatus(StatusCodes.BAD_REQUEST)
        }
        const userInfo = await this.userCredentialsModel.getCredentials(username);
        const userChats = userInfo.rooms;
        for (let i = 0; i < userChats.length; i++) {
            const chatName = userChats[i];
            const chatHistory = await this.chatModel.getChatHistory(chatName);
            chatsHistory.push({ [chatName]: chatHistory });
        }
        next(chatsHistory);
    }

    async addMessageToDB(user: BasicUser, message: IncomingMessage, date: Date) {
        const timestamp = date.getTime();
        await this.chatModel.addChatMessage(message.chatName, message.text, user.username, timestamp, user.avatar);
    }

}