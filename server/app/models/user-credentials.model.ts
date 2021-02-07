import { inject, injectable } from 'inversify';
import { DatabaseModel } from '@app/models/database.model'
import { TYPES } from '@app/types';

@injectable()
export class UserCredentialsModel {

    constructor(@inject(TYPES.DatabaseModel) private databaseModel: DatabaseModel) {}

    async getLoginInfo(username) {
        try {
            return this.databaseModel.client.db().collection("user-login").findOne({ 'username': username });
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
        console.log("We are on the moon");
    }

    async logoutUser(username) {
        try {
            await this.databaseModel.client.db().collection("logged_users").deleteOne({ 'username': username });
        } catch (e) {
            console.error(e);
        }
        console.log("Logout successfull");
    }    
}



