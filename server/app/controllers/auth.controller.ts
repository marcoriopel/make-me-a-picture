import { AuthService } from '@app/services/auth.service';
import { TYPES } from '@app/types';
import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { jwt } from 'jsonwebtoken';

@injectable()
export class AuthController {
    router: Router;

    constructor(@inject(TYPES.AuthService) private authService: AuthService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

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