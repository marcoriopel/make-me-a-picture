import { inject, injectable } from 'inversify';
import { DatabaseModel } from '@app/models/database.model'
import { TYPES } from '@app/types';

@injectable()
export class UsersModel {

    constructor(@inject(TYPES.DatabaseModel) private databaseModel: DatabaseModel) {
        this.databaseModel = DatabaseModel.getInstance();
    }

    async getUserInfo(username) {
        try {
            return await this.databaseModel.client.db("database").collection("users").findOne({ 'username': username });
        } catch (e) {
            console.error(e);
        }
    }

    async registerUser(username: string, password: string, name: string, surname: string, avatar: number) {
        try {
            await this.databaseModel.client.db("database").collection("users").insertOne({ 'username': username, 'password': password, 'name': name, 'surname': surname, 'avatar': avatar, 'rooms': ["General"] });
        } catch (e) {
            console.error(e);
        }
    }

    async addUserToChat(username: string, chatId: string) {
        try {
            await this.databaseModel.client.db("database").collection("users").updateOne({ 'username': username }, { $pull: {'rooms': chatId} });
            await this.databaseModel.client.db("database").collection("users").updateOne({ 'username': username }, { $push: {'rooms': chatId} });
        } catch (e) {
            console.error(e);
        }
    }

    async removeUserFromChat(username: string, chatId: string) {
        try {
            await this.databaseModel.client.db("database").collection("users").updateOne({ 'username': username }, { $pull: {'rooms': chatId} });
        } catch (e) {
            console.error(e);
        }
    }
}



