import { inject, injectable } from 'inversify';
import { DatabaseModel } from '@app/models/database.model'
import { TYPES } from '@app/types';
import { BasicUser } from '@app/ressources/interfaces/user.interface';

@injectable()
export class GamesModel {
    
    constructor(@inject(TYPES.DatabaseModel) private databaseModel: DatabaseModel) {
        this.databaseModel = DatabaseModel.getInstance();
    }

    async setGameInfo(gameName: string, gameType: number, players: BasicUser[], score: number[], startDate: number, endDate: number) {
        try {
            await this.databaseModel.client.db("database").collection("games").insertOne({ "gameName": gameName, "gameType": gameType, "players": players, "score": score, "start": startDate, "end": endDate});
        } catch (e) {
            console.error(e);
        }
    }

    async getGames(username: string) {
        try {
            return await this.databaseModel.client.db("database").collection("games").find({'players.username' : username}).toArray();
        } catch (e) {
            console.error(e);
        }
    }

    async getMutualGames(username: string, usernameVPlayer: string) {
        try {
            return await this.databaseModel.client.db("database").collection("games").find( {$and: [{'players.username' : username} , {'players.username' : usernameVPlayer} ]}).toArray();
        } catch (e) {
            console.error(e);
        }
    }
}