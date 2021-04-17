import { DrawingsModel } from '@app/models/drawings.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { NextFunction, Request, Response } from "express";
import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { Drawing, FeedImage } from '@app/ressources/interfaces/drawings.interface';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuid } from 'uuid';
import { UsersModel } from '@app/models/users.model';

@injectable()
export class DrawingsService {

    constructor(
        @inject(TYPES.UsersModel) private usersModel: UsersModel,
        @inject(TYPES.DrawingsModel) private drawingsModel: DrawingsModel) {
    }

    async addDrawing(req: Request, res: Response, user: BasicUser) {
        try {
            let drawing: Drawing
            if ((req.body.pencilStrokes instanceof Object)) {
                drawing = {
                    "drawingId": uuid(),
                    "difficulty": req.body.difficulty,
                    "hints": req.body.hints,
                    "drawingVotes": 0,
                    "eraserStrokes": req.body.eraserStrokes,
                    "pencilStrokes": req.body.pencilStrokes,
                    "drawingName": req.body.drawingName
                };
            } else {
                drawing = {
                    "drawingId": uuid(),
                    "difficulty": JSON.parse(req.body.difficulty),
                    "hints": JSON.parse(req.body.hints),
                    "drawingVotes": 0,
                    "eraserStrokes": JSON.parse(req.body.eraserStrokes),
                    "pencilStrokes": JSON.parse(req.body.pencilStrokes),
                    "drawingName": JSON.parse(req.body.drawingName)
                };
            }
            if (!drawing.pencilStrokes.length || !drawing.drawingName.length || drawing.difficulty === undefined || !drawing.hints.length)
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
        return await this.drawingsModel.getDrawing(words[random].drawingId)
    }

    async vote(req: Request, res: Response, user: BasicUser) {
        try {
            if (req.body.isUpvote == undefined || req.body.drawingId == undefined) {
                return res.sendStatus(StatusCodes.BAD_REQUEST)
            }

            await this.drawingsModel.vote(req.body.drawingId, req.body.isUpvote);
            const artistUsername = (await this.drawingsModel.getDrawing(req.body.drawingId)).username;
            await this.usersModel.vote(artistUsername, req.body.isUpvote);
            await this.drawingsModel.removeBadDrawing(req.body.drawingId);
            return res.sendStatus(StatusCodes.OK);
        }
        catch (e) {
            console.log(e);
            return res.status(StatusCodes.BAD_REQUEST).send(e.message);
        }
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
            next(drawingInfo.slice(Math.max(drawingInfo.length - 10, 0)));
        }
        catch (e) {
            return res.status(StatusCodes.BAD_REQUEST).send(e.message);
        }
    }

}

