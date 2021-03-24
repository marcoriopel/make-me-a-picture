import { inject, injectable } from 'inversify';
import { DatabaseModel } from '@app/models/database.model'
import { TYPES } from '@app/types';
import { UserCredentialsModel } from './user-credentials.model';

@injectable()
export class ChatModel {

    constructor(@inject(TYPES.DatabaseModel) private databaseModel: DatabaseModel) {
        this.databaseModel = DatabaseModel.getInstance();
    }

    async getChatHistory(chatRoomId) {
        try {
            return await this.databaseModel.client.db("chats").collection(chatRoomId).find().toArray();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getChatInfo(chatRoomId) {
        try {
            return await this.databaseModel.client.db("database").collection("chat-names").findOne({ "chatId": chatRoomId });
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getChatsList() {
        try {
            return await this.databaseModel.client.db("database").collection("chat-names").find({}, { projection: { _id: 0 } }).toArray();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async addChatMessage(chatRoomId, message, username, timestamp, avatar) {
        try {
            await this.databaseModel.client.db("chats").collection(chatRoomId).insertOne({ "username": username, "message": message, "timestamp": timestamp, "avatar": avatar });
        } catch (e) {
            throw e;
        }
    }

    async createChat(chatRoomId, chatName) {
        try {
            await this.databaseModel.client.db("chats").createCollection(chatRoomId);
            await this.databaseModel.client.db("database").collection("chats").insertOne({ "chatId": chatRoomId, "chatName": chatName, "users": [] });
        } catch (e) {
            throw e;
        }
    }

    async deleteChat(chatRoomId) {
        try {
            await this.databaseModel.client.db("chats").collection(chatRoomId).drop();
            await this.databaseModel.client.db("database").collection("chats").deleteOne({ "chatId": chatRoomId });
        } catch (e) {
            throw e;
        }
    }

    async getUsersInChat(chatRoomId) {
        try {
            return await this.databaseModel.client.db("chats").collection("chats").findOne({ "chatId": chatRoomId }, { projection: { "users": 1, "_id": 0}});
        } catch (e) {
            throw e;
        }
    }

    async addUserToChat(username, chatRoomId) {
        try {
            await this.databaseModel.client.db("database").collection("chats").updateOne({ "chatId": chatRoomId }, { $pull: {'users': username} });
            await this.databaseModel.client.db("database").collection("chats").updateOne({ "chatId": chatRoomId }, { $push: {'users': username} });
        } catch (e) {
            throw e;
        }
    }

    async removeUserFromChat(username, chatRoomId) {
        try {
            await this.databaseModel.client.db("database").collection("chats").updateOne({ "chatId": chatRoomId }, { $pull: {'users': username} });
        } catch (e) {
            throw e;
        }
    }
}