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
        let timestamp: number = date.getTime();
        this.socketService.getSocket().to(message.chatId).emit('message', { "user": user, "text": message.text, "timestamp": timestamp, "textColor": "#000000", chatId: message.chatId });
        if (message.chatId == 'General') {
            this.socketService.getSocket().emit('message', { "user": user, "text": message.text, "timestamp": timestamp, "textColor": "#000000", chatId: message.chatId });
        }
    }

    async getAllUserChats(username: string, res: Response, next: NextFunction) {
        var chatNames = [];
        try {
            const userInfo = await this.usersModel.getUserInfo(username);
            const userChats = userInfo.rooms;
            for (let chatId of userChats) {
                const chatInfo = await this.chatModel.getChatInfo(chatId);
                if (chatInfo == null) {
                    await this.usersModel.removeUserFromChat(username, chatId);
                }
                else {
                    chatNames.push({ "chatId": chatId, "chatName": chatInfo["chatName"], "users": chatInfo["users"], "isGameChat": chatInfo["isGameChat"] });
                }
            }
            next(chatNames);
        }
        catch (e) {
            console.error(e)
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
            await this.chatModel.createChat(chatId, chatName, false);
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
        try {
            await this.chatModel.removeUserFromChat(username, chatId);
            const response = await this.chatModel.getUsersInChat(chatId);
            if (!response) {
                throw new Error("Chat does not exist");
            }
            else if (response.users.length == 0) {
                this.chatModel.deleteChat(chatId);
            }
        }
        catch (e) {
            console.error(e);
        }
    }

    async deleteChatRequest(chatId: string, res: Response, next: NextFunction) {
        try {
            const success = await this.deleteChat(chatId);
            if (success) {
                next();
            }
            else {
                throw new Error("chat does not exist")
            }
        }
        catch (e) {
            return res.status(StatusCodes.BAD_REQUEST).send(e.message);
        }
    }

    async deleteChat(chatId: string): Promise<boolean> {
        try {
            const chatInfo = await this.chatModel.getChatInfo(chatId);
            if (!chatInfo) {
                throw new Error("Tried to delete chat that does not exist")
            }
            else {
                for (let username of chatInfo.users) {
                    await this.usersModel.removeUserFromChat(username, chatId);
                }
                await this.chatModel.deleteChat(chatId);
                this.socketService.getSocket().to(chatId).emit('message', { "user": { username: "System", avatar: -1 }, "text": "Ce canal a été supprimé", "timestamp": 0, "textColor": "#000000", chatId: chatId });
                return true;
            }
        }
        catch (e) {
            console.error(e);
            return false
        }
    }

}
