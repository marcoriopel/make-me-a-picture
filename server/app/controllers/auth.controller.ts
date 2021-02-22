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
          const token = this.tokenService.generateAccesToken(req.body.username);
          res.status(StatusCodes.OK).send({ token });
        }
        else {
          res.sendStatus(StatusCodes.UNAUTHORIZED);
        }
      });
    });


    this.router.post('/register', (req, res) => {
      console.log(req.body);
      this.authService.registerUser(req.body.username, req.body.password, req.body.name, req.body.surname, req.body.avatar).then((response) => {
        if (response) {
          // TODO: Generate Json object with an interface to pass to the token generator
          const token = this.tokenService.generateAccesToken(req.body.username);
          res.status(StatusCodes.OK).send({ token });
        }
        else {
          res.sendStatus(StatusCodes.FORBIDDEN);
        }
      });
    });

    this.router.post('/logout', (req: Request, res: Response) => {
      this.tokenService.authenticateToken(req, res, (username: any) => {
        this.authService.addUserToLogCollection(username, false)
        res.sendStatus(StatusCodes.ACCEPTED);
      });
    });

  }
}


