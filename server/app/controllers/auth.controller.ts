import { AuthService } from '@app/services/auth.service';
import { TYPES } from '@app/types';
import { Router } from 'express';
import { inject, injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';
import {
  ReasonPhrases,
  StatusCodes,
} from 'http-status-codes';


@injectable()
export class AuthController {
  router: Router;

  constructor(@inject(TYPES.AuthService) private authService: AuthService) {
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
          let token = jwt.sign(req.body.username, 'secretKey')
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
          let token = jwt.sign(req.body.username, 'secretKey')
          res.status(StatusCodes.OK).send({ token });
        }
        else {
          res.sendStatus(StatusCodes.FORBIDDEN);
        }
      });
    });


    
  }
}


