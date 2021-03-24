import { UserCredentialsModel } from '@app/models/user-credentials.model';
import { UserLogsModel } from '@app/models/user-logs.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';

@injectable()
export class UserService {

    constructor(
        @inject(TYPES.UserCredentialsModel) private userCredentialsModel: UserCredentialsModel,
        @inject(TYPES.UserLogsModel) private userLogsModel: UserLogsModel) {
    }

    async addUserToChat(username: string, chatId: string) {
        await this.userCredentialsModel.addUserToChat(username, chatId);
    }

    async removeUserFromChat(username: string, chatId: string) {
        await this.userCredentialsModel.removeUserFromChat(username, chatId);
    }
}