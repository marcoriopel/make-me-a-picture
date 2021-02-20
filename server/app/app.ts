import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { inject, injectable } from 'inversify';
import * as logger from 'morgan';
import { TYPES } from './types';
import { AuthController } from '@app/controllers/auth.controller';
import { DatabaseModel } from './models/database.model';

@injectable()
export class Application {
    private readonly internalError: number = 500;
    app: express.Application;


    constructor(
        @inject(TYPES.AuthController) private authController: AuthController,
        @inject(TYPES.DatabaseModel) private databaseModel: DatabaseModel 
        ) {
        this.app = express();

        this.swaggerConfig();
        this.config();

        this.databaseModel = DatabaseModel.getInstance();
        this.databaseModel.startDB();
        this.bindRoutes();
    }

    private swaggerConfig(): void {
        const swaggerUi = require('swagger-ui-express');
        const swaggerJSDoc = require('swagger-jsdoc');

        const swaggerDefinition = {
            openapi: '3.0.0',
            swaggerURL: '/swagger',
            info: {
              title: 'API for the best application ever',
              version: '1.0.0',
            },
            servers: [
                {
                  url: 'http://localhost:3000',
                  description: 'Development server',
                },
              ], 
          };
          
        const options = {
            swaggerDefinition,
            // Paths to files containing OpenAPI definitions
            apis: ['./app/controllers/*.ts'],
        };

        const swaggerSpec = swaggerJSDoc(options);

        this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); 
    }

    private config(): void {
        this.app.use(logger('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }


    bindRoutes(): void {
        this.app.use('/api/auth', this.authController.router);
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