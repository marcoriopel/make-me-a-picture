import { inject, injectable } from 'inversify';
import { DatabaseModel } from '@app/models/database.model'
import { TYPES } from '@app/types';

@injectable()
export class UserCredentialsModel {

    constructor(@inject(TYPES.DatabaseModel) private databaseModel: DatabaseModel) {
        this.databaseModel = DatabaseModel.getInstance();
    }

    async getCredentials(username) {
        try {
            return await this.databaseModel.client.db("database").collection("user-credentials").findOne({ 'username': username });
        } catch (e) {
            console.error(e);
        }
    }

    async registerUser(username: string, password: string, name: string, surname: string, avatar: number) {
        try {
            await this.databaseModel.client.db("database").collection("user-credentials").insertOne({ 'username': username, 'password': password, 'name': name, 'surname': surname, 'avatar': avatar, 'rooms': ["General"] });
        } catch (e) {
            console.error(e);
        }
    }
}



