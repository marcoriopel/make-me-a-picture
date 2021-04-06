import { inject, injectable } from 'inversify';
import { DatabaseModel } from '@app/models/database.model'
import { TYPES } from '@app/types';
import { Drawing } from '@app/ressources/interfaces/drawings.interface';
import * as AWS from 'aws-sdk';
import { BasicUser } from '@app/ressources/interfaces/user.interface';

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

    async uploadImageToS3(imageId: string, image: any) {
        const base64Data = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        const type = image.split(';')[0].split('/')[1];
        var uploadParams = { Bucket: "drawingimages", Key: `${imageId}.${type}`, Body: base64Data, ContentType: `image/${type}`, ContentEncoding: 'base64', ACL: 'public-read', };
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

    async removeImageFromS3(imageId: string) {
        const type = "png";
        var imageParams = { Bucket: "drawingimages", Key: `${imageId}.${type}` };
        this.s3.deleteObject(imageParams, (err, data) => {
            if (err) {
                console.log("Error", err);
                throw err;
            }
            if (data) {
                console.log("Upload Success");
            }
        });
    }


    async addImageToFeed(imageId: string, user: BasicUser, timestamp: any) {
        try {
            const numberOfImages = await this.databaseModel.client.db("database").collection("feed").countDocuments();
            if (numberOfImages > 50) {
                const oldestImage = await this.databaseModel.client.db("database").collection("feed").find().sort({ "timestamp": 1 }).limit(1);
                await this.databaseModel.client.db("database").collection("feed").deleteOne({ 'id': oldestImage.id });
                await this.removeImageFromS3(oldestImage.id);

            }
            await this.databaseModel.client.db("database").collection("feed").insertOne({ 'username': user.username, 'avatar': user.avatar, 'timestamp': timestamp, 'id': imageId });
        } catch (e) {
            console.error(e);
        }

    }

    async getFeedInfo() {
        try {
            return await this.databaseModel.client.db("database").collection("feed").find().toArray();
        } catch (e) {
            console.error(e);
            throw e;
        }

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



