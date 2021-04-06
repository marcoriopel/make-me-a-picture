import { AuthService } from '@app/services/auth.service';
import { LobbyManagerService } from '@app/services/managers/lobby-manager.service';
import { TokenService } from '@app/services/token.service';
import { TYPES } from '@app/types';
import { Router, Response, Request } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import * as lobbyInterface from '@app/ressources/interfaces/lobby.interface';
import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { GameManagerService } from '@app/services/managers/game-manager.service';


@injectable()
export class GamesController {
  router: Router;

  constructor(
    @inject(TYPES.TokenService) private tokenService: TokenService,
    @inject(TYPES.LobbyManagerService) private lobbyManagerService: LobbyManagerService,
    @inject(TYPES.GameManagerService) private gameManagerService: GameManagerService,
  ) {
    this.configureRouter();
    this.tokenService = TokenService.getInstance();
  }

  private configureRouter(): void {
    this.router = Router();

    this.router.post('/create/public', (req, res) => {
      this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
        this.lobbyManagerService.create(req, res, false, (lobbyId: string) => {
          res.status(StatusCodes.OK).send({ lobbyId })
        });
      });
    });

    this.router.post('/create/private', (req, res) => {
      this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
        this.lobbyManagerService.create(req, res, true, (lobbyId: string, lobbyInviteId: string) => {
          res.status(StatusCodes.OK).send({ lobbyId, lobbyInviteId })
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

    this.router.post('/start', (req, res) => {
      this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
        this.gameManagerService.start(user.username, req, res, () => {
          res.sendStatus(StatusCodes.OK)
        });
      });
    });

    this.router.post('/join/public', (req, res) => {
      this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
        this.lobbyManagerService.joinPublic(req, res, user, () => {
          res.sendStatus(StatusCodes.OK)
        });
      });
    });

    this.router.post('/join/private', (req, res) => {
      this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
        this.lobbyManagerService.joinPrivate(req, res, user, (lobbyId: string) => {
          res.status(StatusCodes.OK).send(lobbyId);
        });
      });
    });


    this.router.delete('/leave', (req, res) => {
      this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
        this.lobbyManagerService.leave(req, res, user, () => {
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

    this.router.post('/upload', (req, res) => {
      this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
        this.gameManagerService.addGameImageURL(user, req, res, () => {
          res.sendStatus(StatusCodes.OK);
        });
      });
    });


    this.router.post('/word/selection', (req, res) => {
      this.tokenService.authenticateToken(req, res, (user: BasicUser) => {
        this.gameManagerService.chooseDrawingWord(user.username, req, res, () => {
          res.sendStatus(StatusCodes.OK)
        });
      });
    });

  }
}