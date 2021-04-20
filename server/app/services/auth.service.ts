import { UsersModel } from '@app/models/users.model';
import { UserLogsModel } from '@app/models/user-logs.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { NextFunction, Request, Response } from "express";
import { DetailedUser, AuthInfo } from '@app/ressources/interfaces/user.interface';
import { StatusCodes } from 'http-status-codes';

@injectable()
export class AuthService {

    constructor(
        @inject(TYPES.UsersModel) private usersModel: UsersModel,
        @inject(TYPES.UserLogsModel) private userLogsModel: UserLogsModel) {
    }

    async loginUser(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const authInfo: AuthInfo = { 'username': req.body.username, 'password': req.body.password };
            const userInfo: DetailedUser = await this.usersModel.getUserInfo(authInfo.username);
            if (userInfo && userInfo.password == authInfo.password) {
                if (await this.checkIfUserAlreadyLoggedIn(req.body.username)) {
                    return res.status(StatusCodes.BAD_REQUEST).send("Already logged in");
                }
                else {
                    await this.addUserToLogCollection(authInfo.username, true);
                    next(userInfo);
                }
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

    async checkIfUserAlreadyLoggedIn(username: string) {
        let lastLogin = await this.getLastLogin(username);
        let lastLogout = await this.getLastLogout(username);
        if (!lastLogin) {
            return false;
        }
        if (lastLogout && lastLogout > lastLogin) {
            return false
        }
        return true;
    }

    async addUserToChat(username: string, chatId: string) {
        await this.usersModel.addUserToChat(username, chatId);
    }

    async removeUserFromChat(username: string, chatId: string) {
        await this.usersModel.removeUserFromChat(username, chatId);
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
            if (userInfo.avatar == undefined || !userInfo.surname || !userInfo.name || !userInfo.username || !userInfo.password || userInfo.avatar > 5 || userInfo.avatar < 0) {
                return res.sendStatus(StatusCodes.BAD_REQUEST)
            }
            if (userInfo.username == "Bernard" || userInfo.username == "Ginette" || userInfo.username == "Bernard" || userInfo.username == "Émilio") {
                return res.sendStatus(StatusCodes.CONFLICT);
            }
            const userDB: DetailedUser = await this.usersModel.getUserInfo(userInfo.username);
            if (!userDB) {
                await this.usersModel.registerUser(userInfo.username, userInfo.password, userInfo.name, userInfo.surname, userInfo.avatar);
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



    async returnLastLogout(username: string, res: Response, next: NextFunction): Promise<any> {
        let lastLogout = await this.getLastLogout(username);
        if (!lastLogout) {
            return res.sendStatus(StatusCodes.NOT_FOUND);
        }
        else {
            next(lastLogout);
        }
    }

    async getLastLogout(username: string) {
        let logouts;
        try {
            logouts = await this.userLogsModel.getLogouts(username);
        }
        catch (e) {
            console.log(e);
            return null;
        }
        if (!logouts.length)
            return null;
        else {
            let lastLogout = 0;
            for (let logout of logouts) {
                if (logout.timestamp > lastLogout)
                    lastLogout = logout.timestamp
            }
            return lastLogout;
        }
    }


    async getLastLogin(username: string) {
        let logins;
        try {
            logins = await this.userLogsModel.getLogins(username);
        }
        catch (e) {
            console.log(e);
            return null;
        }
        if (!logins.length)
            return null;
        else {
            let lastLogin = 0;
            for (let login of logins) {
                if (login.timestamp > lastLogin)
                    lastLogin = login.timestamp
            }
            return lastLogin;
        }
    }

}

