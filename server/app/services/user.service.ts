import { UsersModel } from '@app/models/users.model';
import { UserLogsModel } from '@app/models/user-logs.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';

@injectable()
export class UserService {

    constructor(
        @inject(TYPES.UsersModel) private usersModel: UsersModel,
        @inject(TYPES.UserLogsModel) private userLogsModel: UserLogsModel) {
    }

    async addUserToChat(username: string, chatId: string) {
        await this.usersModel.addUserToChat(username, chatId);
    }

    async removeUserFromChat(username: string, chatId: string) {
        await this.usersModel.removeUserFromChat(username, chatId);
    }
}