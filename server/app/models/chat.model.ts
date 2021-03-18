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

    async createChat(chatRoomId) {
        try {
            await this.databaseModel.client.db("chats").createCollection(chatRoomId);
        } catch (e) {
            throw e;
        }
    }

    async linkChatNameToId(chatRoomId, chatName) {
        try {
            return await this.databaseModel.client.db("database").collection("chat-names").insertOne({ "chatId": chatRoomId, "chatName": chatName });
        } catch (e) {
            throw e;
        }
    }
}