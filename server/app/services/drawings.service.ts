import { DrawingsModel } from '@app/models/drawings.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { NextFunction, Request, Response } from "express";
import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { Drawing, FeedImage } from '@app/ressources/interfaces/drawings.interface';
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

            if (!req.body.imageUrl || !drawing.strokes.length || !drawing.drawingName.length || drawing.difficulty === undefined || !drawing.hints.length)
                throw Error("Drawing is invalid");

            await this.drawingsModel.addDrawing(user.username, drawing);
            await this.drawingsModel.uploadImageToS3(drawing.drawingId, req.body.imageUrl)
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

    async getRandomDrawing(difficulty, excludedDrawings): Promise<Drawing> {
        let words = await this.drawingsModel.getWordsOfDifficulty(difficulty);
        if (words.length < 1) {
            throw new Error("Empty");
        }
        for (let drawing of excludedDrawings) {
            words = words.filter(word => word.drawingName !== drawing);
        }

        if (words.length < 1) {
            throw new Error("Max drawings");
        }

        let random = Math.floor(Math.random() * words.length);
        return await this.drawingsModel.getDrawing(words[random]._id)
    }

    async getGameVirtualPlayerImage(id: string): Promise<any> {
        return await this.drawingsModel.getImage(id);
    }

    async uploadImage(image: FeedImage): Promise<any> {
        const id = uuid();
        try {
            await this.drawingsModel.uploadImageToS3(id, image.imageURL);
            await this.drawingsModel.addImageToFeed(id, image.user, image.timestamp);
        }
        catch (e) {
            console.log(e);
        }
    }

    async getFeedInfo(res: Response, next: NextFunction) {
        try {
            const drawingInfo = await this.drawingsModel.getFeedInfo();
            next(drawingInfo);
        }
        catch (e) {
            return res.status(StatusCodes.BAD_REQUEST).send(e.message);
        }
    }

}

