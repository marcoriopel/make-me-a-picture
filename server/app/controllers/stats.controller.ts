import { TokenService } from '@app/services/token.service';
import { TYPES } from '@app/types';
import { Router } from 'express';
import { inject, injectable } from 'inversify';
import {
  StatusCodes,
} from 'http-status-codes';
import { BasicUser, DetailedUser } from '@app/ressources/interfaces/user.interface';
import { UserService } from '@app/services/user.service';


@injectable()
export class StatsController {
  router: Router;

  constructor(
    @inject(TYPES.TokenService) private tokenService: TokenService,
    @inject(TYPES.UserService) private userService: UserService,
  ) {
    this.configureRouter();
    this.tokenService = TokenService.getInstance();
  }

  private configureRouter(): void {
    this.router = Router();

    this.router.get('/private', (req, res) => {
      this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
        this.userService.getPrivateInfo(user.username, res, (privateInfo: any) => {
          res.status(StatusCodes.OK).send({ privateInfo });
        });
      });
    });

    this.router.get('/leaderboard', (req, res) => {
      this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
        this.userService.getTop10(req, res, (top10: any) => {
          res.status(StatusCodes.OK).send({ top10 });
        });
      });
    });

  }
}
