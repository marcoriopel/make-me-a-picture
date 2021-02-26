import { IncomingMessage } from '@app/ressources/interfaces/incoming-message.interface';
import { injectable } from 'inversify';
import * as socketio from "socket.io";
import { NextFunction, Request, Response } from "express";
import { GameType } from '@app/ressources/variables/game-variables'
import { Lobby } from '@app/classes/lobby/lobby';
import { ClassicLobby } from '@app/classes/lobby/classic-lobby';
import { v4 as uuid } from 'uuid';
import { CoopLobby } from '@app/classes/lobby/coop-lobby';
import { SoloLobby } from '@app/classes/lobby/solo-lobby';
import {StatusCodes} from 'http-status-codes';
import * as lobbyInterface from '@app/ressources/interfaces/lobby.interface';

@injectable()
export class LobbyManagerService {
    lobbies: Map<string, Lobby> = new Map<string, Lobby>();
    socket: socketio.Server;

    constructor() { }

    setSocket(io : socketio.Server){
        this.socket = io;
    }

    create(req: Request, res: Response, next: NextFunction){
        const lobbyId: string = uuid();
        const lobbyInfo: lobbyInterface.LobbyCreation = req.body;
        if(!lobbyInterface.validateLobbyCreation(lobbyInfo)){
            return res.sendStatus(StatusCodes.BAD_REQUEST);
        }
        switch(lobbyInfo.gameType) {
            case GameType.CLASSIC:
                this.lobbies.set(lobbyId, new ClassicLobby(lobbyInfo.difficulty, lobbyInfo.gameName));
                break;
            case GameType.SOLO:
                this.lobbies.set(lobbyId, new SoloLobby(lobbyInfo.difficulty, lobbyInfo.gameName));
                break;
            case GameType.COOP:
                this.lobbies.set(lobbyId, new CoopLobby(lobbyInfo.difficulty, lobbyInfo.gameName));
                break;
            default:
                return res.sendStatus(StatusCodes.BAD_REQUEST);
        }
        next(lobbyId)
    }

    join(req: Request, res: Response, username: string, next: NextFunction): void {
        var lobby: Lobby = this.lobbies.get(req.body.lobbyId);
        lobby.addPlayer(username);
        this.dispatchNewPlayer(username, req.body.lobbyId);
        next();
    }

    private dispatchNewPlayer(username: string, lobbyId: string): void {
        this.socket.to(lobbyId).emit('joinLobby', {"username": username});
    }
}