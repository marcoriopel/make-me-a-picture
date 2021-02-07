import { AuthService } from '@app/services/auth.service';
import { TYPES } from '@app/types';
import { Router } from 'express';
import { inject, injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';


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
         * /api/auth/user:
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
        this.router.post('/user', (req, res) => {
            this.authService.loginUser(req.body).then((response) => {
                if (response) {
                  let payload = { subject: res.insertId }
                  let token = jwt.sign(payload, 'secretKey')
                  res.status(200).send({ token });
                }
                else {
                  res.sendStatus(403);
                }
              });
        });
    }
}