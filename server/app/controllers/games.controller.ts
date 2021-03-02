import { AuthService } from '@app/services/auth.service';
import { LobbyManagerService } from '@app/services/lobby-manager.service';
import { TokenService } from '@app/services/token.service';
import { TYPES } from '@app/types';
import { Router, Response, Request } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import * as lobbyInterface from '@app/ressources/interfaces/lobby.interface';
import { BasicUser } from '@app/ressources/interfaces/user.interface';


@injectable()
export class GamesController {
  router: Router;

  constructor(
    @inject(TYPES.TokenService) private tokenService: TokenService,
    @inject(TYPES.LobbyManagerService) private lobbyManagerService: LobbyManagerService,
  ) {
    this.configureRouter();
    this.tokenService = TokenService.getInstance();
  }

  private configureRouter(): void {
    this.router = Router();

    this.router.post('/create', (req, res) => {
      this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
        this.lobbyManagerService.create(req, res, (lobbyId: string) => {
          res.status(StatusCodes.OK).send({ lobbyId })
        });
      });
    });

    this.router.get('/list', (req, res) => {
        this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
            this.lobbyManagerService.getLobbies(req, res, (lobbies: lobbyInterface.Lobby[]) => {
              res.status(StatusCodes.OK).send({ lobbies })
            });
        });
    });

    this.router.post('/join', (req, res) => {
        this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
            this.lobbyManagerService.join(req, res, user, () => {
              res.sendStatus(StatusCodes.OK)
            });
        });
    });

    this.router.post('/add/virtual/player', (req, res) => {
        this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
            this.lobbyManagerService.addVirtualPlayer(req, res, user, () => {
              res.sendStatus(StatusCodes.OK)
            });
        });
    });

    this.router.delete('/remove/virtual/player', (req, res) => {
        this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
            this.lobbyManagerService.removeVirtualPlayer(req, res, () => {
              res.sendStatus(StatusCodes.OK)
            });
        });
    });

  }
}