import { ExistingUsersModel } from '@app/models/existingUsers.model';
import { TYPES } from '@app/types';
import { Router } from 'express';
import { inject, injectable } from 'inversify';

@injectable()
export class LoginController {
    router: Router;

    constructor(@inject(TYPES.ExistingUsersModel) private existingUsersModel: ExistingUsersModel) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/user', (req, res) => {
            this.existingUsersModel.loginUser(req.body);
        });
    }
}