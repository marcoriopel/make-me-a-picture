import { IncomingMessage } from '@app/ressources/interfaces/incoming-message.interface';
import * as socketio from "socket.io";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { UsersModel } from '@app/models/users.model';
import { ChatModel } from '@app/models/chat.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { SocketService } from '../sockets/socket.service';
import { v4 as uuid } from 'uuid';


@injectable()
export class ChatManagerService {

    constructor(
        @inject(TYPES.SocketService) private socketService: SocketService,
        @inject(TYPES.UsersModel) private usersModel: UsersModel,
        @inject(TYPES.ChatModel) private chatModel: ChatModel,) {
        this.socketService = SocketService.getInstance();
    }

    dispatchMessage(user: BasicUser, message: IncomingMessage, date: Date) {
        let tmpHour: number = date.getHours() + (date.getTimezoneOffset() / 60) - 5;
        if (tmpHour < 0) { tmpHour += 24 }
        let hours: string = tmpHour.toString().length == 1 ? "0" + tmpHour.toString() : tmpHour.toString();
        let minutes: string = date.getMinutes().toString().length == 1 ? "0" + date.getMinutes().toString() : date.getMinutes().toString();
        let seconds: string = date.getSeconds().toString().length == 1 ? "0" + date.getSeconds().toString() : date.getSeconds().toString();
        let timeStamp: string = hours + ":" + minutes + ":" + seconds;
        this.socketService.getSocket().to(message.chatId).emit('message', { "user": user, "text": message.text, "timeStamp": timeStamp, "textColor": "#000000", chatId: message.chatId });
        if (message.chatId == 'General') {
            this.socketService.getSocket().emit('message', { "user": user, "text": message.text, "timeStamp": timeStamp, "textColor": "#000000", chatId: message.chatId });
        }
    }

    async getAllUserChats(username: string, res: Response, next: NextFunction) {
        var chatNames = [];
        try {
            const userInfo = await this.usersModel.getUserInfo(username);
            const userChats = userInfo.rooms;
            for (let chatId of userChats) {
                const chatInfo = await this.chatModel.getChatInfo(chatId);
                chatNames.push({ "chatId": chatId, "chatName": chatInfo["chatName"], "users": chatInfo["users"] });
            }
            next(chatNames);
        }
        catch (e) {
            return res.status(StatusCodes.BAD_REQUEST).send(e.message);
        }
    }
    async getAllUserChatsHistory(username: string, res: Response, next: NextFunction) {
        var chatsHistory = [];
        try {
            const userInfo = await this.usersModel.getUserInfo(username);
            const userChats = userInfo.rooms;
            for (let chatId of userChats) {
                const chatHistory = await this.chatModel.getChatHistory(chatId);
                chatsHistory.push({ [chatId]: chatHistory });
            }
            next(chatsHistory);
        }
        catch (e) {
            return res.status(StatusCodes.BAD_REQUEST).send(e.message);
        }
    }

    async getChatHistory(chatId: any, res: Response, next: NextFunction) {
        try {
            const chatHistory = await this.chatModel.getChatHistory(chatId);
            next(chatHistory);
        }
        catch (e) {
            return res.status(StatusCodes.BAD_REQUEST).send(e.message);
        }
    }

    async getAllChats(res: Response, next: NextFunction) {
        try {
            const chats = await this.chatModel.getChatsList();
            next(chats);
        }
        catch (e) {
            return res.status(StatusCodes.BAD_REQUEST).send(e.message);
        }

    }

    async addMessageToDB(user: BasicUser, message: IncomingMessage, date: Date) {
        const timestamp = date.getTime();
        try {
            await this.chatModel.addChatMessage(message.chatId, message.text, user.username, timestamp, user.avatar);
        }
        catch (e) {
            console.log(e);
        }
    }

    async createChat(chatName: string, res: Response, next: NextFunction) {
        try {
            const chatId = uuid();
            await this.chatModel.createChat(chatId, chatName);
            next(chatId);
        }
        catch (e) {
            return res.status(StatusCodes.BAD_REQUEST).send(e.message);
        }

    }

    async addUserToChat(username: string, chatId: string) {
        await this.chatModel.addUserToChat(username, chatId);
    }

    async removeUserFromChat(username: string, chatId: string) {
        try{
            await this.chatModel.removeUserFromChat(username, chatId);
            const response = await this.chatModel.getUsersInChat(chatId);
            if (response.users.length == 0) {
                this.chatModel.deleteChat(chatId);
            }
        }
        catch(e){
            console.error(e);
        }
    }

}
