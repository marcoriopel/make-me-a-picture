import { AuthService } from '@app/services/auth.service';
import { LobbyManagerService } from '@app/services/lobby-manager.service';
import { TokenService } from '@app/services/token.service';
import { TYPES } from '@app/types';
import { Router, Response, Request } from 'express';
import { inject, injectable } from 'inversify';
import {
  StatusCodes,
} from 'http-status-codes';
import { UserInfo, AuthInfo } from '@app/classes/user';


@injectable()
export class GamesController {
  router: Router;

  constructor(
    @inject(TYPES.TokenService) private tokenService: TokenService,
    @inject(TYPES.AuthService) private authService: AuthService,
    @inject(TYPES.LobbyManagerService) private lobbyManagerService: LobbyManagerService,
  ) {
    this.configureRouter();
    this.tokenService = TokenService.getInstance();
  }

  private configureRouter(): void {
    this.router = Router();

    this.router.post('/create', (req, res) => {
        this.tokenService.authenticateToken(req, res, (username: any) => { 
            this.lobbyManagerService.create();
        });
    });
  }
}