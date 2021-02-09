import { AuthService } from '@app/services/auth.service';
import { TokenService } from '@app/services/token.service';
import { TYPES } from '@app/types';
import { Router, Response, Request } from 'express';
import { inject, injectable } from 'inversify';
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
          const user = req.bpdy.username;
          // TODO: Add user to ther userConnected[]

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
          const user = req.bpdy.username;
          // TODO: Add user to the userConnected[]
          
          let token = this.tokenService.generateAccesToken(user);
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
      this.tokenService.authentifiateToken(req, res, (user: any) => {
          //TODO: Remove user from the userConnected[]

          res.sendStatus(StatusCodes.ACCEPTED);
      });
    });
    
  }
}


