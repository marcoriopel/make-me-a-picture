import { inject, injectable } from 'inversify';
import { DatabaseModel } from '@app/models/database.model'
import { TYPES } from '@app/types';
import { Drawing } from '@app/ressources/interfaces/drawings.interface';

@injectable()
export class DrawingsModel {

    constructor(@inject(TYPES.DatabaseModel) private databaseModel: DatabaseModel) {
        this.databaseModel = DatabaseModel.getInstance();
    }

    async addDrawing(username: string, drawing: Drawing) {
        try {
            await this.databaseModel.client.db("database").collection("drawings").insertOne({ 'username': username, "drawing": drawing });
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}



