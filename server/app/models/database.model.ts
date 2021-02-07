import { injectable } from 'inversify';
import { MongoClient }from 'mongodb';

@injectable()
export class DatabaseModel {
    mongoURL: string = "mongodb+srv://" + process.env.MONGO_USERNAME + ":" + process.env.MONGO_PASSWORD + "@cluster0.oia6z.mongodb.net/database?retryWrites=true&w=majority";
    client: MongoClient = new MongoClient(this.mongoURL, { useUnifiedTopology: true, useNewUrlParser: true });

    async startDB() {
        try {
            await this.client.connect();
        } catch (e) {
            console.error(e);
        }
        console.log("We are on the moon");
    }
}