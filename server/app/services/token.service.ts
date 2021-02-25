import { injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express";

@injectable()
export class TokenService {
    private static instance: TokenService;

    public static getInstance(): TokenService {
        if (!TokenService.instance) {
            TokenService.instance = new TokenService();
        }
        return TokenService.instance;
    }
    /**
     * Extract the data from a jwt
     * @param token: jwt token
     * @returns User information
     */
    public getTokenInfo(token) {
        try {
            return jwt.verify(token, process.env.ACCES_TOKEN_SECRET);
        } catch (err) {
            // err
        }
    }

    /**
     * Generate a new acces to the user
     * @param username: Data to encryp in the jwt
     * @returns encrypted token
     */
    public generateAccesToken(username: string): any {
        return jwt.sign(username, process.env.ACCES_TOKEN_SECRET);
    }

    /** 
     * Verif if user have acces to the server in a sub function
     * @param res: Request
     * @param res: Response if the token is not valid
     * @param next: NextFunction to exec if the token is valid
     */
    public authenticateToken(req: Request, res: Response, next: NextFunction): any {
        const token = req.headers['authorization'];
        if (!token) { return res.sendStatus(401); }
        jwt.verify(token, process.env.ACCES_TOKEN_SECRET, (err: any, username: any): any => {
            if (err) { return res.sendStatus(403); }
            next(username);
        });
    }

    public hasAccess(req: Request, res: Response) {
        const token = req.headers['authorization'];
        if (!token) { return res.sendStatus(401); }
        jwt.verify(token, process.env.ACCES_TOKEN_SECRET, (err: any, username: any): any => {
            if (err) { return res.sendStatus(403); }
        });
    }

}

