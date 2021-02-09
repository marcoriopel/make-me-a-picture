import { AuthService } from '@app/services/auth.service';
import { TokenService } from '@app/services/token.service';
import { TYPES } from '@app/types';
import { Router, Response, Request } from 'express';
import { inject, injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';
import {
  ReasonPhrases,
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
  }

  private configureRouter(): void {
    this.router = Router();

    /**
     * @swagger
     * /api/auth/authenticate:
     *   post:
     *     summary: Login user request
     *     description: Send a post request to try to authenticate a user.
     *     parameters:
     *         - name: username
     *           description: Your username
     *           in: formData
     *           required: true
     *           type: string
     *         - name: password
     *           description: Your password
     *           in: formData
     *           required: true
     *           type: string
     */
    this.router.post('/authenticate', (req, res) => {
      this.authService.loginUser(req.body.username, req.body.password).then((response) => {
        if (response) {
          // TODO: Generate Json object with an interface to pass to the token generator
          let user = req.body.username;
          let token = this.tokenService.generateAccesToken(user);
          res.status(StatusCodes.OK).send({ token });
        }
        else {
          res.sendStatus(StatusCodes.UNAUTHORIZED);
        }
      });
    });


    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     summary: Register user request
     *     description: Send a post request to try to register a user.
     *     parameters:
     *         - name: username
     *           description: Your username
     *           in: formData
     *           required: true
     *           type: string
     *         - name: password
     *           description: Your password
     *           in: formData
     *           required: true
     *           type: string
     */
    this.router.post('/register', (req, res) => {
      this.authService.registerUser(req.body.username, req.body.password).then((response) => {
        if (response) {
          // TODO: Generate Json object with an interface to pass to the token generator
          let token = this.tokenService.generateAccesToken(req.body.username)
          res.status(StatusCodes.OK).send({ token });
        }
        else {
          res.sendStatus(StatusCodes.FORBIDDEN);
        }
      });
    });

    this.router.post('/test', (req: Request, res: Response) => {
      // this.tokenService.authentifiateToken(req, res, (user: any) => {
          // console.log("Controlled section acceded by :" + user);
          res.sendStatus(StatusCodes.ACCEPTED);
      // });
    });

    /**
     * Logout of the app
     */
    // this.router.post('/logout', (req: Request, res: Response) => {
    //     // this.tokenService.getTokenInfo()
    //     // this.refreshTokens = this.refreshTokens.filter((token: string) => token !== req.body.token);
    //     res.sendStatus(204);
    // });
    
  }
}


