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
import { BasicUser } from '@app/ressources/interfaces/user.interface';

@injectable()
export class LobbyManagerService {
    lobbies: Map<string, Lobby> = new Map<string, Lobby>();
    socket: socketio.Server;

    constructor() { }

    setSocket(io : socketio.Server){
        this.socket = io;
    }

    create(req: Request, res: Response, next: NextFunction){
        const lobbyInfo: lobbyInterface.Lobby = req.body;
        lobbyInfo.id = uuid();
        if(!lobbyInterface.validateLobby(lobbyInfo)){
            return res.sendStatus(StatusCodes.BAD_REQUEST);
        }
        switch(lobbyInfo.gameType) {
            case GameType.CLASSIC:
                this.lobbies.set(lobbyInfo.id, new ClassicLobby(lobbyInfo.difficulty, lobbyInfo.gameName));
                break;
            case GameType.SOLO:
                this.lobbies.set(lobbyInfo.id, new SoloLobby(lobbyInfo.difficulty, lobbyInfo.gameName));
                break;
            case GameType.COOP:
                this.lobbies.set(lobbyInfo.id, new CoopLobby(lobbyInfo.difficulty, lobbyInfo.gameName));
                break;
            default:
                return res.sendStatus(StatusCodes.BAD_REQUEST);
        }
        next(lobbyInfo.id)
    }

    getLobbies(req: Request, res: Response, next: NextFunction): void {
        let response: lobbyInterface.Lobby[] = [];
        this.lobbies.forEach((lobby: Lobby, key:string,  map: Map<string, Lobby>) =>{
            response.push({id: key, gameName: lobby.gameName,difficulty: lobby.difficulty, gameType: lobby.gameType});
        })
        next(response);
    }

    join(req: Request, res: Response, user: BasicUser, next: NextFunction): void {
        var lobby: Lobby = this.lobbies.get(req.body.lobbyId);
        lobby.addPlayer(user);
        this.dispatchNewPlayer(user, req.body.lobbyId);
        next();
    }

    private dispatchNewPlayer(user: BasicUser, lobbyId: string): void {
        this.socket.to(lobbyId).emit('joinLobby', {"username": user.username, "avatar":user.avatar});
    }
}