import { AuthService } from '@app/services/auth.service';
import { TokenService } from '@app/services/token.service';
import { TYPES } from '@app/types';
import { Router, Response, Request } from 'express';
import { inject, injectable } from 'inversify';
import {
  StatusCodes,
} from 'http-status-codes';
import { UserInfo, AuthInfo } from '@app/ressources/interfaces/user.interface';


@injectable()
export class AuthController {
  router: Router;

  constructor(
    @inject(TYPES.TokenService) private tokenService: TokenService,
    @inject(TYPES.AuthService) private authService: AuthService
  ) {
    this.configureRouter();
    this.tokenService = TokenService.getInstance();
  }

  private configureRouter(): void {
    this.router = Router();

    this.router.post('/login', (req, res) => {
      this.authService.loginUser(req, res, (userInfo: UserInfo) => {
        const token = this.tokenService.generateAccesToken(userInfo.username, userInfo.avatar);
          const avatar: number = userInfo.avatar;
          res.status(StatusCodes.OK).send({ token, avatar });
      });
    });


    this.router.post('/register', (req, res) => {
      this.authService.registerUser(req, res, (userInfo: UserInfo) => {
        const token = this.tokenService.generateAccesToken(userInfo.username, userInfo.avatar);
        const avatar: number = userInfo.avatar;
        res.status(StatusCodes.OK).send({ token, avatar });
      });
    });

    this.router.post('/logout', (req: Request, res: Response) => {
      this.tokenService.authenticateToken(req, res, (username: any) => {
        this.authService.addUserToLogCollection(username, false)
        res.sendStatus(StatusCodes.OK);
      });
    });

  }
}


