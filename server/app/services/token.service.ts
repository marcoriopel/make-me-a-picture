import { inject, injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express";
import { TYPES } from '@app/types';
import { UserCredentialsModel } from '@app/models/user-credentials.model';

@injectable()
export class TokenService {

    constructor() { }

    /**
     * Extract the data from a jwt
     * @param token: jwt token
     * @returns User information
     */
    public getTokenInfo(token) {
        try {
            return jwt.verify(token, 'secretKey'); // TODO: CHANGE WITH process.env.ACCES_TOKEN_SECRET
        } catch (err) {
            // err
        }
    }

    /**
     * Generate a new acces to the user
     * @param user: Data to encryp in the jwt
     * @returns encrypted token
     */
    public generateAccesToken(user: any): any {
        return jwt.sign(user, 'secretKey'); // TODO: CHANGE WITH process.env.ACCES_TOKEN_SECRET
    }

    /** 
     * Verif if user have acces to the server in a sub function
     * @param res: Request
     * @param res: Response if the token is not valid
     * @param next: NextFunction to exec if the token is valid
     */
    public authenticateToken(req: Request, res: Response, next: NextFunction): any {
        console.log('test');
        const token = req.headers['authorization'];
        if (!token) { return res.sendStatus(401); }
        jwt.verify(token, 'secretKey', (err: any, user: any): any => { // TODO: CHANGE WITH process.env.ACCES_TOKEN_SECRET
            if (err) { return res.sendStatus(403); }
            next(user);
        });
    }

    public asAccess(req: Request, res: Response) {
        const token = req.headers['authorization'];
        if (!token) { return res.sendStatus(401); }
        jwt.verify(token, 'secretKey', (err: any, user: any): any => { // TODO: CHANGE WITH process.env.ACCES_TOKEN_SECRET
            if (err) { return res.sendStatus(403); }
        });
    }

}

