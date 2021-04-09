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
            await this.databaseModel.client.db("database").collection("drawings").insertOne({ 'drawingId': drawing.drawingId, 'username': username, "strokes": drawing.strokes, "drawingVotes": drawing.drawingVotes, "drawingName": drawing.drawingName, "difficulty": drawing.difficulty, "hints": drawing.hints });
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getDrawing(drawingId: string) {
        try {
            return await this.databaseModel.client.db("database").collection("drawings").findOne({ 'drawingId': drawingId });
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getWordsOfDifficulty(difficulty: number) {
        try {
            return await this.databaseModel.client.db("database").collection("drawings").find({ "difficulty": difficulty }, { projection: { "drawingName": 1, "drawingId": 1, "_id":0 }}).toArray();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async vote(drawingId: string, isUpvote: boolean) {
        try {
            const vote = isUpvote ? 1 : -1;
            const voteResponse = await this.databaseModel.client.db("database").collection("drawings").updateOne({ "drawingId": drawingId }, { $inc: { "drawingVotes": vote }});
            if(!voteResponse.modifiedCount){
                throw new Error('Could not vote on drawing because no such drawing exists');
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async removeBadDrawing(drawingId: string) {
        try {
            const response = await this.databaseModel.client.db("database").collection("drawings").deleteOne( { "drawingId": drawingId, "drawingVotes": { $lt: -10 } } );
            if(response.deletedCount){
                console.log("deleted drawing " + drawingId + " from database because it recieved too many down votes")
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}



