import { UserCredentialsModel } from '@app/models/user-credentials.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express";

@injectable()
export class JWTService {


    constructor(@inject(TYPES.UserCredentialsModel) private userCredentialsModel: UserCredentialsModel) {
    }

    async loginUser(userInfo) {
        try {
            const user = await this.userCredentialsModel.getCredentials(userInfo.username);
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

    async registerUser(userInfo) {
        try {
            const user = await this.userCredentialsModel.getCredentials(userInfo.username);
            if (!user) {
                await this.userCredentialsModel.registerUser(userInfo);
                return true;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
        return false;
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Generate a new acces to the user
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    public generateAccesToken(user: any): any {
        return jwt.sign(user, process.env.ACCES_TOKEN_SECRET);
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Verif if user have acces to the server in a sub function
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    public authentifiateToken(req: Request, res: Response, next: NextFunction): any {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token === undefined) { return res.sendStatus(401); }
    jwt.verify(token, process.env.ACCES_TOKEN_SECRET, (err: any, user: any): any => {
        if (err) { return res.sendStatus(403); }
        next(user);
    });

            /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        * Logout of the app
        * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
       router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
        console.log(req.body.token);
        this.refreshTokens = this.refreshTokens.filter((token: string) => token !== req.body.token);
        res.sendStatus(STATUS.NoContent);
    });
}

}

