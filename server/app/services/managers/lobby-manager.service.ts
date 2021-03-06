import { IncomingMessage } from '@app/ressources/interfaces/incoming-message.interface';
import { inject, injectable } from 'inversify';
import * as socketio from "socket.io";
import { NextFunction, Request, Response } from "express";
import { GameType } from '@app/ressources/variables/game-variables'
import { Lobby } from '@app/classes/lobby/lobby';
import { ClassicLobby } from '@app/classes/lobby/classic-lobby';
import { v4 as uuid } from 'uuid';
import { CoopLobby } from '@app/classes/lobby/coop-lobby';
import { SoloLobby } from '@app/classes/lobby/solo-lobby';
import { StatusCodes } from 'http-status-codes';
import * as lobbyInterface from '@app/ressources/interfaces/lobby.interface';
import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { TYPES } from '@app/types';
import { SocketService } from '../sockets/socket.service';

@injectable()
export class LobbyManagerService {

    static lobbies: Map<string, Lobby> = new Map<string, Lobby>();

    constructor(
        @inject(TYPES.SocketService) private socketService: SocketService,) {
        this.socketService = SocketService.getInstance();
    }

    create(req: Request, res: Response, next: NextFunction) {
        const lobbyInfo: lobbyInterface.Lobby = req.body;
        lobbyInfo.id = uuid();
        if (!lobbyInterface.validateLobby(lobbyInfo)) {
            return res.status(StatusCodes.BAD_REQUEST).send("Provided lobby info is invalid");
        }
        lobbyInfo.gameType = Number(lobbyInfo.gameType);
        lobbyInfo.difficulty = Number(lobbyInfo.difficulty);
        switch (lobbyInfo.gameType) {
            case GameType.CLASSIC:
                LobbyManagerService.lobbies.set(lobbyInfo.id, new ClassicLobby(lobbyInfo.difficulty, lobbyInfo.gameName));
                break;
            case GameType.SOLO:
                LobbyManagerService.lobbies.set(lobbyInfo.id, new SoloLobby(lobbyInfo.difficulty, lobbyInfo.gameName));
                break;
            case GameType.COOP:
                LobbyManagerService.lobbies.set(lobbyInfo.id, new CoopLobby(lobbyInfo.difficulty, lobbyInfo.gameName));
                break;
            default:
                return res.status(StatusCodes.BAD_REQUEST).send("Lobby game type is invalid");
        }
        next(lobbyInfo.id)
    }

    getLobbies(req: Request, res: Response, next: NextFunction): void {
        let response: lobbyInterface.Lobby[] = [];
        LobbyManagerService.lobbies.forEach((lobby: Lobby, key: string, map: Map<string, Lobby>) => {
            response.push({ id: key, gameName: lobby.getGameName(), difficulty: lobby.getDifficulty(), gameType: lobby.getGameType() });
        })
        next(response);
    }

    join(req: Request, res: Response, user: BasicUser, next: NextFunction): void {
        if (this.lobbyExist(req.body.lobbyId)) {
            try {
                const lobby: Lobby = LobbyManagerService.lobbies.get(req.body.lobbyId);
                lobby.addPlayer(user, req.body.socketId);
                this.dispatchTeams(req.body.lobbyId);
            }
            catch (err) {
                return res.status(StatusCodes.NOT_ACCEPTABLE).send(err.message);
            }
        }
        else
            return res.status(StatusCodes.NOT_FOUND).send("Lobby does not exist or game already started");
        next();
    }

    addVirtualPlayer(req: Request, res: Response, user: BasicUser, next: NextFunction): void {
        if (req.body.teamNumber != 0 && req.body.teamNumber != 1) {
            return res.status(StatusCodes.BAD_REQUEST).send("Provided team number for virtual player is invalid");
        }
        if (this.lobbyExist(req.body.lobbyId)) {
            try {
                const lobby: Lobby = LobbyManagerService.lobbies.get(req.body.lobbyId);
                (lobby as ClassicLobby).addVirtualPlayer(req.body.teamNumber);
                this.dispatchTeams(req.body.lobbyId);
            }
            catch (err) {
                return res.status(StatusCodes.NOT_ACCEPTABLE).send(err.message);
            }
        }
        else
            return res.status(StatusCodes.NOT_FOUND).send("Lobby does not exist or game already started");
        next();
    }

    removeVirtualPlayer(req: Request, res: Response, next: NextFunction): void {
        console.log(req.query);
        if (req.query.teamNumber != 0 && req.query.teamNumber != 1 || req.query.username == undefined) {
            return res.status(StatusCodes.BAD_REQUEST).send("Provided team number for virtual player is invalid");
        }
        if (this.lobbyExist(req.query.lobbyId)) {
            try {
                const lobby: Lobby = LobbyManagerService.lobbies.get(req.query.lobbyId);
                (lobby as ClassicLobby).removeVirtualPlayer(req.query.teamNumber, req.query.username);
                this.dispatchTeams(req.query.lobbyId);
            }
            catch (err) {
                return res.status(StatusCodes.NOT_FOUND).send(err.message);
            }
        }
        else
            return res.status(StatusCodes.NOT_FOUND).send("Lobby does not exist or game already started");
        next();
    }

    lobbyExist(lobbyId: string): boolean {
        return LobbyManagerService.lobbies.has(lobbyId);
    }

    dispatchTeams(lobbyId: string): void {
        const lobby: Lobby = LobbyManagerService.lobbies.get(lobbyId);
        this.socketService.getSocket().to(lobbyId).emit('dispatchTeams', { "players": lobby.getPlayers() });
    }
}