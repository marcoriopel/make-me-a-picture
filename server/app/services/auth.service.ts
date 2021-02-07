import { UserCredentialsModel } from '@app/models/user-credentials.model';
import { TYPES } from '@app/types';
import { Router } from 'express';
import { inject, injectable } from 'inversify';

@injectable()
export class AuthService {

    constructor(@inject(TYPES.UserCredentialsModel) private userCredentialsModel: UserCredentialsModel) {
    }

    async loginUser(userInfo) {
        try {
            const user = await this.userCredentialsModel.getLoginInfo(userInfo.username);
            if (user && user.password == userInfo.password) {
                await this.userCredentialsModel.loginUser(userInfo.username);;
                return true;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
        return false;
    }

}