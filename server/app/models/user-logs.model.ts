import { inject, injectable } from 'inversify';
import { DatabaseModel } from '@app/models/database.model'
import { TYPES } from '@app/types';

@injectable()
export class UserLogsModel {

    constructor(@inject(TYPES.DatabaseModel) private databaseModel: DatabaseModel) {
        this.databaseModel = DatabaseModel.getInstance();
    }
    async logUser(username, timeStamp, isLogin) {
        try {
            await this.databaseModel.client.db("database").collection("user-logs").insertOne({ 'username': username, 'isLogin': isLogin, 'timeStamp': timeStamp });
        } catch (e) {
            console.error(e);
        }
    }

    async getLogouts(username) {
        try {
            return await this.databaseModel.client.db("database").collection("user-logs").find({ 'username': username, "isLogin": false }).toArray();
        } catch (e) {
            console.error(e);
        }
    }

    async getLogins(username) {
        try {
            return await this.databaseModel.client.db("database").collection("user-logs").find({ 'username': username, "isLogin": true }).toArray();
        } catch (e) {
            console.error(e);
        }

    }
}