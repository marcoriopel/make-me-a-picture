import { inject, injectable } from 'inversify';
import { LobbyManagerService } from './lobby-manager.service';
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { GameType } from '@app/ressources/variables/game-variables';



@injectable()
export class GameManagerService {

    constructor() {
    }

    start(username: string, req: Request, res: Response, next: NextFunction) {
        if (!req.body.lobbyId || !LobbyManagerService.lobbies.has(req.body.lobbyId)) {
            return res.sendStatus(StatusCodes.BAD_REQUEST);
        }
        const players = LobbyManagerService.lobbies.get(req.body.lobbyId).getPlayers();
        let isPlayerInLobby = false;
        switch (LobbyManagerService.lobbies.get(req.body.lobbyId).getGameType()) {
            case GameType.CLASSIC:
                if (players.length != 4)
                    return res.sendStatus(StatusCodes.NOT_ACCEPTABLE);
                break;
            case GameType.SOLO:
                if (players.length != 1)
                    return res.sendStatus(StatusCodes.NOT_ACCEPTABLE);
                break;
            case GameType.COOP:
                if (players.length < 2)
                    return res.sendStatus(StatusCodes.NOT_ACCEPTABLE);
                break;
            default:
                return res.sendStatus(StatusCodes.BAD_REQUEST);
        }
        for (let player of players) {
            if (username == player.username)
                isPlayerInLobby = true;
        }
        if (!isPlayerInLobby)
            return res.sendStatus(StatusCodes.NOT_ACCEPTABLE);
        console.log("created game");
        next();
    }
}