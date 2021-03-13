import { DrawingsModel } from '@app/models/drawings.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { Request, Response } from "express";
import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { Drawing } from '@app/ressources/interfaces/drawings.interface';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuid } from 'uuid';

@injectable()
export class DrawingsService {

    constructor(
        @inject(TYPES.DrawingsModel) private drawingsModel: DrawingsModel) {
    }

    async addDrawing(req: Request, res: Response, user: BasicUser) {
        try {
            const drawing: Drawing = {
                "drawingId": uuid(),
                "difficulty": req.body.difficulty,
                "hints": req.body.hints,
                "drawingVotes": 0,
                "strokes": req.body.strokes,
                "drawingName": req.body.drawingName
            };

            if (!drawing.strokes.length || !drawing.drawingName.length || drawing.difficulty === undefined || !drawing.hints.length)
                throw Error("Drawing is invalid");

            await this.drawingsModel.addDrawing(user.username, drawing);
            return res.sendStatus(StatusCodes.OK);
        }
        catch (e) {
            console.log(e);
            return res.status(StatusCodes.BAD_REQUEST).send(e.message);
        }
    }

    async getWordSuggestions(difficulty): Promise<string[]> {
        let wordSuggestions: string[] = [];
        let words = await this.drawingsModel.getWordsOfDifficulty(difficulty);
        if (words.length < 3) {
            throw new Error('Database is empty')
        }
        while (wordSuggestions.length < 3) {
            let random = Math.floor(Math.random() * words.length);
            if (!wordSuggestions.includes(words[random].drawingName)) {
                wordSuggestions.push(words[random].drawingName)
            }
        }
        return wordSuggestions;
    }

    async getRandomDrawing(difficulty): Promise<Drawing> {
        let words = await this.drawingsModel.getWordsOfDifficulty(difficulty);
        if (words.length < 1) {
            throw new Error('Database is empty')
        }
        let random = Math.floor(Math.random() * words.length);
        return await this.drawingsModel.getDrawing(words[random]._id)
    }

}

