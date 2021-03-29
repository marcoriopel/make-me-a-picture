import { inject, injectable } from 'inversify';
import { DatabaseModel } from '@app/models/database.model'
import { TYPES } from '@app/types';
import { Drawing } from '@app/ressources/interfaces/drawings.interface';
import * as AWS from 'aws-sdk';

@injectable()
export class DrawingsModel {
    private s3;
    constructor(@inject(TYPES.DatabaseModel) private databaseModel: DatabaseModel) {
        this.databaseModel = DatabaseModel.getInstance();
        const credentials = new AWS.Credentials(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
        AWS.config.update({
            credentials: credentials,
            region: "us-east-2"
        });
        this.s3 = new AWS.S3();
    }

    async addDrawing(username: string, drawing: Drawing) {
        try {
            await this.databaseModel.client.db("database").collection("drawings").insertOne({ 'drawingId': drawing.drawingId, 'username': username, "strokes": drawing.strokes, "drawingVotes": drawing.drawingVotes, "drawingName": drawing.drawingName, "difficulty": drawing.difficulty, "hints": drawing.hints });
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async uploadImage(imageId: string, image: any,) {
        var uploadParams = { Bucket: "drawingimages", Key: imageId, Body: image };
        this.s3.upload(uploadParams, (err, data) => {
            if (err) {
                console.log("Error", err);
                return err;
            }
            if (data) {
                console.log("Upload Success");
                return data;
            }
        });
    }

    async getImage(imageId: string) {
        var params = { Bucket: "drawingimages", Key: imageId };
        await this.s3.getObject(params, (err, data) => {
            if (err) {
                console.log("Error", err);
            }
            if (data) {
                console.log("Success in retrieval");
                return data.Body;
            }

        });
    }

    async getDrawing(id: string) {
        try {
            return await this.databaseModel.client.db("database").collection("drawings").findOne({ '_id': id });
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getWordsOfDifficulty(difficulty: number) {
        try {
            return await this.databaseModel.client.db("database").collection("drawings").find({ "difficulty": difficulty }, { projection: { "drawingName": 1, "_id": 1 } }).toArray();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}



