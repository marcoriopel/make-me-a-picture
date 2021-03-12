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

    async getRandomWords(difficulty: number) {
        let wordSuggestions: string[] = [];
        let words: any[];
        try {
            wordSuggestions = [];
            words = await this.databaseModel.client.db("database").collection("drawings").find({ "difficulty": difficulty.toString() }, { "drawingName": 1, "_id": 0 }).toArray();
            if (words.length < 3) {
                throw new Error('Database is empty')
            }
            while (wordSuggestions.length < 3) {
                let random = Math.floor(Math.random() * words.length);
                if (!wordSuggestions.includes(words[random].drawingName)) {
                    wordSuggestions.push(words[random].drawingName)
                }
            }
            console.log("out of model");
            return wordSuggestions;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}



