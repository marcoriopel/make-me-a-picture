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

            if (!drawing.strokes.length || !drawing.drawingName.length)
                throw Error("Drawing is empty");

            await this.drawingsModel.addDrawing(user.username, drawing);
            return res.sendStatus(StatusCodes.OK);
        }
        catch (e) {
            console.log(e);
            return res.sendStatus(StatusCodes.BAD_REQUEST);
        }
    }

}

