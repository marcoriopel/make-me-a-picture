import { AuthService } from '@app/services/auth.service';
import { TokenService } from '@app/services/token.service';
import { TYPES } from '@app/types';
import { Router, Response, Request } from 'express';
import { inject, injectable } from 'inversify';
import {
  StatusCodes,
} from 'http-status-codes';


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

    this.router.post('/authenticate', (req, res) => {
      this.authService.loginUser(req.body.username, req.body.password).then((response) => {
        if (response) {
          // TODO: Generate Json object with an interface to pass to the token generator
          const user = req.body.username;
          // TODO: Add user to ther userConnected[]

          const token = this.tokenService.generateAccesToken(user);
          res.status(StatusCodes.OK).send({ token });
        }
        else {
          res.sendStatus(StatusCodes.UNAUTHORIZED);
        }
      });
    });


    this.router.post('/register', (req, res) => {
      this.authService.registerUser(req.body.username, req.body.password, req.body.name, req.body.surname, req.body.avatar).then((response) => {
        if (response) {
          // TODO: Generate Json object with an interface to pass to the token generator
          const username = req.body.username;
          this.authService.addUserToLogCollection(username, true)
          const token = this.tokenService.generateAccesToken(username);
          res.status(StatusCodes.OK).send({ token });
        }
        else {
          res.sendStatus(StatusCodes.FORBIDDEN);
        }
      });
    });

    /**
     * Logout from the app
     * + Exemple d'utilisation de lock une route avec un token
     */
    this.router.post('/logout', (req: Request, res: Response) => {
      this.tokenService.authenticateToken(req, res, (username: any) => {
        //TODO: Remove user from the userConnected[]
        this.authService.addUserToLogCollection(username, false)
        res.sendStatus(StatusCodes.ACCEPTED);
      });
    });

  }
}


