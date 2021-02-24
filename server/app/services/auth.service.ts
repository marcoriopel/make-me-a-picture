import { UserCredentialsModel } from '@app/models/user-credentials.model';
import { UserLogsModel } from '@app/models/user-logs.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { NextFunction, Request, Response } from "express";
import { NewUser, User } from '@app/classes/user';
import { StatusCodes } from 'http-status-codes';

@injectable()
export class AuthService {

    constructor(
        @inject(TYPES.UserCredentialsModel) private userCredentialsModel: UserCredentialsModel,
        @inject(TYPES.UserLogsModel) private userLogsModel: UserLogsModel) {
    }

    async loginUser(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            // const user = await this.userCredentialsModel.getCredentials(username);
            // if (user && user.password == password) {
            //     await this.addUserToLogCollection(username, true);
            //     return user;
            const userInfo: User = { 'username': req.body.username, 'password': req.body.password };
            const userDB = await this.userCredentialsModel.getCredentials(userInfo.username);
            if (userDB && userDB.password == userInfo.password) {
                await this.addUserToLogCollection(userInfo.username, true);
                next(userDB);
            }
            else {
                return res.sendStatus(StatusCodes.NOT_FOUND);
            }
        }
        catch {
            return res.sendStatus(StatusCodes.BAD_REQUEST)
        }
    }

    async addUserToLogCollection(username: string, isLogin: boolean) {
        const date: Date = new Date();
        await this.userLogsModel.logUser(username, date.getTime(), isLogin);
    }

    async registerUser(req: Request, res: Response, next: NextFunction): Promise<any> {
        let userInfo: NewUser;
        try {
            // const user = await this.userCredentialsModel.getCredentials(username);
            // if (!user) {
            //     await this.userCredentialsModel.registerUser(username, password, name, surname, avatar);
            //     await this.addUserToLogCollection(username, true);
            //     return user;
            userInfo = {
                'surname': req.body.surname,
                'name': req.body.name,
                'username': req.body.username,
                'password': req.body.password,
                'avatar': req.body.avatar
            }
            if (!userInfo.avatar || !userInfo.surname || !userInfo.name || !userInfo.username || !userInfo.password || userInfo.avatar > 5 || userInfo.avatar < 0) {
                return res.sendStatus(StatusCodes.BAD_REQUEST)
            }
            const userDB = await this.userCredentialsModel.getCredentials(userInfo.username);
            if (!userDB) {
                await this.userCredentialsModel.registerUser(userInfo.username, userInfo.password, userInfo.name, userInfo.surname, userInfo.avatar);
                await this.addUserToLogCollection(userInfo.username, true);
                next(userInfo)
            }
            else {
                return res.sendStatus(StatusCodes.CONFLICT);
            }
        }
        catch (e) {
            console.error(e);
            return res.sendStatus(StatusCodes.BAD_REQUEST);
        }
    }

}

