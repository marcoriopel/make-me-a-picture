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
            await this.databaseModel.client.db("database").collection("users").insertOne({ 
                'username': username, 
                'password': password, 
                'name': name, 
                'surname': surname, 
                'avatar': avatar, 
                'gamesPlayed': 0, 
                'timePlayed': 0, 
                'bestSoloScore': 0, 
                'bestCoopScore': 0,  
                'classicWinRatio': 0,
                'meanGameTime': 0,
                'classicGamesPlayed': 0,
                'classicGamesWon': 0,
                'totalDrawingVotes': 0,
                'rooms': ["General"] 
            });
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

    async updateUserStats(userInfo: any){
        try {
            await this.databaseModel.client.db("database").collection("users").updateOne({ 'username': userInfo.username }, { $set:{
                'gamesPlayed': userInfo.gamesPlayed, 
                'timePlayed': userInfo.timePlayed,
                'bestSoloScore': userInfo.bestSoloScore,
                'bestCoopScore': userInfo.bestCoopScore,
                'classicWinRatio': userInfo.classicWinRatio,
                'meanGameTime': userInfo.meanGameTime,
                'classicGamesPlayed': userInfo.classicGamesPlayed,
                'classicGamesWon': userInfo.classicGamesWon,
            }});
        } catch (e) {
            console.error(e);
        }
    }

    async getTop10ClassicWinRatio(){
        try {
         return await this.databaseModel.client.db("database").collection("users").aggregate([ 
            {$sort: {"classicWinRatio": -1}},
            {$project: {"name": 0, "_id": 0, "password":0, "meanGameTime":0, "surname": 0, "rooms": 0}}, 
            {$limit: 10}
        ]).toArray();
        } catch (e) {
            console.error(e);
        }
    }

    async getTop10BestCoopScore(){
        try {
         return await this.databaseModel.client.db("database").collection("users").aggregate([
            {$sort: {"bestCoopScore": -1}}, 
            {$project: {"name": 0, "_id": 0, "password":0, "meanGameTime":0, "surname": 0, "rooms": 0}}, 
            {$limit: 10}
        ]).toArray();
        } catch (e) {
            console.error(e);
        }
    }

    async getTop10BestCSoloScore(){
        try {
         return await this.databaseModel.client.db("database").collection("users").aggregate([ 
            {$sort: {"bestSoloScore": -1}},
            {$project: {"name": 0, "_id": 0, "password":0, "meanGameTime":0, "surname": 0, "rooms": 0}}, 
            {$limit: 10}
        ]).toArray();
        } catch (e) {
            console.error(e);
        }
    }

    async getTop10MostTimePlayed(){
        try {
         return await this.databaseModel.client.db("database").collection("users").aggregate([ 
            {$sort: {"timePlayed": -1}}, 
            {$project: {"name": 0, "_id": 0, "password":0, "meanGameTime":0, "surname": 0, "rooms": 0}}, 
            {$limit: 10}
        ]).toArray();
        } catch (e) {
            console.error(e);
        }
    }

    async getTop10MostGamesPlayed(){
        try {
         return await this.databaseModel.client.db("database").collection("users").aggregate([ 
            {$sort: {"gamesPlayed": -1}}, 
            {$project: {"name": 0, "_id": 0, "password":0, "meanGameTime":0, "surname": 0, "rooms": 0}}, 
            {$limit: 10}
        ]).toArray();
        } catch (e) {
            console.error(e);
        }
    }

    async getTop10MostClassicGamesWon(){
        try {
         return await this.databaseModel.client.db("database").collection("users").aggregate([ 
            {$sort: {"classicGamesWon": -1}}, 
            {$project: {"name": 0, "_id": 0, "password":0, "meanGameTime":0, "surname": 0, "rooms": 0}}, 
            {$limit: 10}
        ]).toArray();
        } catch (e) {
            console.error(e);
        }
    }

    async getTop10MostUpvotes(){
        try {
         return await this.databaseModel.client.db("database").collection("users").aggregate([ 
            {$sort: {"totalDrawingVotes": -1}}, 
            {$project: {"name": 0, "_id": 0, "password":0, "meanGameTime":0, "surname": 0, "rooms": 0}}, 
            {$limit: 10}
        ]).toArray();
        } catch (e) {
            console.error(e);
        }
    }

    async vote(artistUsername: string, isUpvote: boolean){
        try {
            const vote = isUpvote ? 1 : -1;
            const voteResponse = await this.databaseModel.client.db("database").collection("users").updateOne({ "username": artistUsername }, { $inc: { "totalDrawingVotes": vote }});
            if(!voteResponse.modifiedCount){
                throw new Error("Did not update user's totalDrawingVotes score because user " + artistUsername + " does not exists anymore");
            }
        } catch (e) {
            console.error(e);
        }
    }
}



