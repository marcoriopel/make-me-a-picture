import { AuthService } from '@app/services/auth.service';
import { DrawingsService } from '@app/services/drawings.service';
import { TokenService } from '@app/services/token.service';
import { TYPES } from '@app/types';
import { Router, Response, Request } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { BasicUser } from '@app/ressources/interfaces/user.interface';


@injectable()
export class DrawingsController {
    router: Router;

    constructor(
        @inject(TYPES.TokenService) private tokenService: TokenService,
        @inject(TYPES.DrawingsService) private drawingsService: DrawingsService,
    ) {
        this.configureRouter();
        this.tokenService = TokenService.getInstance();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/create', (req, res) => {
            this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
                this.drawingsService.addDrawing(req, res, user);
            });
        });

        this.router.patch('/vote', (req, res) => {
            this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
                this.drawingsService.vote(req, res, user);
            });
        });
        this.router.get('/feed/info', (req, res) => {
            this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
                this.drawingsService.getFeedInfo(res, (feedInfo: any) => {
                    res.status(StatusCodes.OK).send({ feedInfo });
                });
            });
        });

    }
}