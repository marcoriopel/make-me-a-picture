import { inject, injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express";
import { TYPES } from '@app/types';
import { UserCredentialsModel } from '@app/models/user-credentials.model';

@injectable()
export class TokenService {

    constructor() {}

    /**
     * Extract the data from a jwt
     * @param token: jwt token
     * @returns User information
     */
    public getTokenInfo(token) {
        try {
            return jwt.verify(token, 'secretKey');
        } catch(err) {
            // err
        } 
    }

    /**
     * Generate a new acces to the user
     * @param user: Data to encryp in the jwt
     * @returns encrypted token
     */
    public generateAccesToken(user: any): any {
        return jwt.sign(user, process.env.ACCES_TOKEN_SECRET);
    }

    /** 
     * Verif if user have acces to the server in a sub function
     * @param res: Request
     * @param res: Response if the token is not valid
     * @param next: NextFunction to exec if the token is valid
     */
    public authentifiateToken(req: Request, res: Response, next: NextFunction): any {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token === undefined) { return res.sendStatus(401); }
    jwt.verify(token, process.env.ACCES_TOKEN_SECRET, (err: any, user: any): any => {
        if (err) { return res.sendStatus(403); }
        next(user);
    });

    // /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    // * Logout of the app
    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    // router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
    //     console.log(req.body.token);
    //     this.refreshTokens = this.refreshTokens.filter((token: string) => token !== req.body.token);
    //     res.sendStatus(STATUS.NoContent);
    // });
}

}

