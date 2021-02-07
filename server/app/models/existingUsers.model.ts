import { inject, injectable } from 'inversify';
import { DatabaseModel } from '@app/models/database.model'
import { TYPES } from '@app/types';

@injectable()
export class ExistingUsersModel {

    constructor(@inject(TYPES.DatabaseModel) private databaseModel: DatabaseModel) {}

    async loginUser(userInfo) {
        try {
            await this.databaseModel.client.db().collection("logged_users").insertOne({ 'username': userInfo.username, "password": userInfo.password });
        } catch (e) {
            console.error(e);
        }
        console.log("We are on the moon");
    }
}