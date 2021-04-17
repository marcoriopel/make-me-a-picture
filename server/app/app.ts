import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { inject, injectable } from 'inversify';
import * as logger from 'morgan';
import { TYPES } from './types';
import { AuthController } from '@app/controllers/auth.controller';
import { DatabaseModel } from './models/database.model';
import { GamesController } from './controllers/games.controller';
import { ChatController } from './controllers/chat.controller';
import { DrawingsController } from './controllers/drawings.controller';
import { StatsController } from './controllers/stats.controller';

@injectable()
export class Application {
    private readonly internalError: number = 500;
    app: express.Application;


    constructor(
        @inject(TYPES.AuthController) private authController: AuthController,
        @inject(TYPES.StatsController) private statsController: StatsController,
        @inject(TYPES.GamesController) private gamesController: GamesController,
        @inject(TYPES.DrawingsController) private drawingsController: DrawingsController,
        @inject(TYPES.ChatController) private chatController: ChatController,
        @inject(TYPES.DatabaseModel) private databaseModel: DatabaseModel
    ) {
        this.app = express();

        this.config();

        this.databaseModel = DatabaseModel.getInstance();
        this.databaseModel.startDB();
        this.bindRoutes();
    }

    private config(): void {
        this.app.use(logger('dev'));
        this.app.use(express.json({ limit: '25mb' }));
        this.app.use(express.urlencoded({ extended: false, limit: '25mb' }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }


    bindRoutes(): void {
        this.app.use('/api/authenticate', this.authController.router);
        this.app.use('/api/stats', this.statsController.router);
        this.app.use('/api/games', this.gamesController.router);
        this.app.use('/api/chat', this.chatController.router);
        this.app.use('/api/drawings', this.drawingsController.router);
        this.errorHandling();
    }

    private errorHandling(): void {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: Error = new Error('Not Found');
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            // tslint:disable-next-line:no-any
            this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user (in production env only)
        // tslint:disable-next-line:no-any
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}
