import { inject, injectable } from 'inversify';
import { DatabaseModel } from '@app/models/database.model'
import { TYPES } from '@app/types';
import { UserCredentialsModel } from './user-credentials.model';

@injectable()
export class ChatModel {

    constructor(@inject(TYPES.DatabaseModel) private databaseModel: DatabaseModel) {
        this.databaseModel = DatabaseModel.getInstance();
    }

    async getChatHistory(chatRoomName) {
        try {
            return await this.databaseModel.client.db("chats").collection(chatRoomName).find().toArray();
        } catch (e) {
            console.error(e);
        }
    }

    async addChatMessage(chatRoomName, message, username, timestamp, avatar) {
        try {
            console.log(chatRoomName);
            await this.databaseModel.client.db("chats").collection(chatRoomName).insertOne({ "username": username, "message": message, "timestamp": timestamp, "avatar": avatar });
        } catch (e) {
            console.error(e);
        }
    }
}