import { inject, injectable } from 'inversify';
import { DatabaseModel } from '@app/models/database.model'
import { TYPES } from '@app/types';
import { UsersModel } from './users.model';

@injectable()
export class ChatModel {

    constructor(@inject(TYPES.DatabaseModel) private databaseModel: DatabaseModel) {
        this.databaseModel = DatabaseModel.getInstance();
    }

    async getChatHistory(chatRoomId: string) {
        try {
            return await this.databaseModel.client.db("chats").collection(chatRoomId).find().toArray();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getChatInfo(chatRoomId: string) {
        try {
            return await this.databaseModel.client.db("database").collection("chats").findOne({ "chatId": chatRoomId });
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getChatsList() {
        try {
            return await this.databaseModel.client.db("database").collection("chats").find({}, { projection: { _id: 0 } }).toArray();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async addChatMessage(chatRoomId: string, message, username, timestamp, avatar) {
        try {
            await this.databaseModel.client.db("chats").collection(chatRoomId).insertOne({ "username": username, "message": message, "timestamp": timestamp, "avatar": avatar });
        } catch (e) {
            throw e;
        }
    }

    async createChat(chatRoomId: string, chatName, isGameChat: boolean) {
        try {
            await this.databaseModel.client.db("chats").createCollection(chatRoomId);
            await this.databaseModel.client.db("database").collection("chats").insertOne({ "chatId": chatRoomId, "chatName": chatName, "isGameChat": isGameChat, "users": [] });
        } catch (e) {
            throw e;
        }
    }

    async deleteChat(chatRoomId: string) {
        try {
            await this.databaseModel.client.db("database").collection("chats").deleteOne({ "chatId": chatRoomId });
            await this.databaseModel.client.db("chats").collection(chatRoomId).drop();
        } catch (e) {
            throw e;
        }
    }

    async getUsersInChat(chatRoomId: string) {
        try {
            return await this.databaseModel.client.db("database").collection("chats").findOne({ "chatId": chatRoomId }, { projection: { "users": 1, "_id": 0 } });
        } catch (e) {
            throw e;
        }
    }

    async addUserToChat(username: string, chatRoomId) {
        try {
            await this.databaseModel.client.db("database").collection("chats").updateOne({ "chatId": chatRoomId }, { $pull: { 'users': username } });
            await this.databaseModel.client.db("database").collection("chats").updateOne({ "chatId": chatRoomId }, { $push: { 'users': username } });
        } catch (e) {
            throw e;
        }
    }

    async removeUserFromChat(username, chatRoomId: string) {
        try {
            await this.databaseModel.client.db("database").collection("chats").updateOne({ "chatId": chatRoomId }, { $pull: { 'users': username } });
        } catch (e) {
            throw e;
        }
    }
}