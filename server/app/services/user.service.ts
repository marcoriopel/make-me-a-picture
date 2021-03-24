import { UsersModel } from '@app/models/users.model';
import { UserLogsModel } from '@app/models/user-logs.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';

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

    async getPrivateInfo(username: string, res: Response, next: NextFunction) {
        if (!username) {
            res.status(StatusCodes.BAD_REQUEST).send("user does not have valid username");
        }
        try{
            let userInfo = await this.usersModel.getUserInfo(username);
            let userLogs = await this.userLogsModel.getLogs(username);

            let privateInfo = {"name" : userInfo.name, "surname" : userInfo.surname, "logs": userLogs}
            next(privateInfo);
        }
        catch(e){
            res.status(StatusCodes.BAD_REQUEST).send(e.message);
        }
    }
}