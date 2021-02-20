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
            return await this.databaseModel.client.db().collection("user-credentials").findOne({ 'username': username });
        } catch (e) {
            console.error(e);
        }
    }

    async loginUser(username) {
        try {
            await this.databaseModel.client.db().collection("logged-users").insertOne({ 'username': username });
        } catch (e) {
            console.error(e);
        }
    }

    async logoutUser(username) {
        try {
            await this.databaseModel.client.db().collection("logged-users").deleteOne({ 'username': username });
        } catch (e) {
            console.error(e);
        }
        console.log("Logout successfull");
    }

    async registerUser(username: string, password: string) {
        try {
            await this.databaseModel.client.db().collection("user-credentials").insertOne({ 'username': username, 'password': password });
        } catch (e) {
            console.error(e);
        }
    }
}



