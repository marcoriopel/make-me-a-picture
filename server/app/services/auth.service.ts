import { UserCredentialsModel } from '@app/models/user-credentials.model';
import { UserLogsModel } from '@app/models/user-logs.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { NextFunction, Request, Response } from "express";
import { DetailedUser, AuthInfo } from '@app/ressources/interfaces/user.interface';
import { StatusCodes } from 'http-status-codes';

@injectable()
export class AuthService {

    constructor(
        @inject(TYPES.UserCredentialsModel) private userCredentialsModel: UserCredentialsModel,
        @inject(TYPES.UserLogsModel) private userLogsModel: UserLogsModel) {
    }

    async loginUser(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const authInfo: AuthInfo = { 'username': req.body.username, 'password': req.body.password };
            const userInfo: DetailedUser = await this.userCredentialsModel.getCredentials(authInfo.username);
            if (userInfo && userInfo.password == authInfo.password) {
                await this.addUserToLogCollection(authInfo.username, true);
                next(userInfo);
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
        try {
            const userInfo: DetailedUser = {
                'surname': req.body.surname,
                'name': req.body.name,
                'username': req.body.username,
                'password': req.body.password,
                'avatar': req.body.avatar
            }
            if (!userInfo.avatar || !userInfo.surname || !userInfo.name || !userInfo.username || !userInfo.password || userInfo.avatar > 5 || userInfo.avatar < 0) {
                return res.sendStatus(StatusCodes.BAD_REQUEST)
            }
            const userDB: DetailedUser = await this.userCredentialsModel.getCredentials(userInfo.username);
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


    async getLastLogout(username: string, res: Response, next: NextFunction): Promise<any> {
        let logouts;
        try {
            logouts = await this.userLogsModel.getLogouts(username);
        }
        catch (e) {
            console.log(e);
            return res.sendStatus(StatusCodes.NOT_FOUND);
        }
        if (!logouts.length)
            return res.sendStatus(StatusCodes.NOT_FOUND);
        else {
            let lastLogout = 0;
            for (let logout of logouts) {
                if (logout.timeStamp > lastLogout)
                    lastLogout = logout.timeStamp
            }
            next(lastLogout);
        }
    }

}

