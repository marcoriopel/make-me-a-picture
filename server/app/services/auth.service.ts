import { UserCredentialsModel } from '@app/models/user-credentials.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';

@injectable()
export class AuthService {

    constructor(@inject(TYPES.UserCredentialsModel) private userCredentialsModel: UserCredentialsModel) {
    }

    async loginUser(username: string, password: string) {
        try {
            const user = await this.userCredentialsModel.getCredentials(username);
            if (user && user.password == password) {
                await this.userCredentialsModel.loginUser(username);;
                return true;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
        return false;
    }

    async registerUser(username: string, password: string, name: string, surname: string, avatar: number) {
        try {
            const user = await this.userCredentialsModel.getCredentials(username);
            if (!user) {
                await this.userCredentialsModel.registerUser(username, password, name, surname, avatar);
                return true;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
        return false;
    }

}

