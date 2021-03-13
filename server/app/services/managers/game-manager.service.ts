import { inject, injectable } from 'inversify';
import { LobbyManagerService } from './lobby-manager.service';
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { GameType } from '@app/ressources/variables/game-variables';
import { DrawingEvent } from '@app/ressources/interfaces/game-events';
import { SocketService } from '../sockets/socket.service';
import { TYPES } from '@app/types';
import { Game } from '@app/classes/game/game';
import { ClassicGame } from '@app/classes/game/classic-game';
import { ClassicLobby } from '@app/classes/lobby/classic-lobby';
import { DrawingsService } from '@app/services/drawings.service'
import { BasicUser } from '@app/ressources/interfaces/user.interface';




@injectable()
export class GameManagerService {

    static games: Map<string, Game> = new Map<string, Game>();
    
    constructor(
        @inject(TYPES.SocketService) private socketService: SocketService,
        @inject(TYPES.DrawingsService) private drawingService: DrawingsService,) {
        this.socketService = SocketService.getInstance();
    }

    start(username: string, req: Request, res: Response, next: NextFunction) {
        if (!req.body.lobbyId || !LobbyManagerService.lobbies.has(req.body.lobbyId)) {
            return res.status(StatusCodes.BAD_REQUEST).send("Lobby id is invalid");
        }
        const lobby = LobbyManagerService.lobbies.get(req.body.lobbyId);
        const players = lobby.getPlayers();
        let isPlayerInLobby = false;
        switch (lobby.getGameType()) {
            case GameType.CLASSIC:
                if (players.length != 4)
                    return res.status(StatusCodes.NOT_ACCEPTABLE).send("Not enough players to start game (4 players required)");
                const game = new ClassicGame(<ClassicLobby>lobby, this.socketService, this.drawingService);
                GameManagerService.games.set(req.body.lobbyId, game);
                LobbyManagerService.lobbies.delete(req.body.lobbyId);
                game.startGame();
                break;
            case GameType.SOLO:
                if (players.length != 1)
                    res.status(StatusCodes.NOT_ACCEPTABLE).send("Not enough players to start game (1 player required)");
                break;
            case GameType.COOP:
                if (players.length < 2 || players.length > 4)
                    res.status(StatusCodes.NOT_ACCEPTABLE).send("Number of players in lobby invalid to start game (2-4 players required)");
                break;
            default:
                return res.status(StatusCodes.BAD_REQUEST).send("Invalid game type");
        }
        for (let player of players) {
            if (username == player.username)
                isPlayerInLobby = true;
        }
        if (!isPlayerInLobby)
            return res.status(StatusCodes.NOT_ACCEPTABLE).send("Request made by user not currently in lobby");
        next();
    }

    chooseDrawingWord(username: string, req: Request, res: Response, next: NextFunction) {
        const drawingName = req.body.drawingName;
        if (!req.body.gameId || !GameManagerService.games.has(req.body.gameId)) {
            return res.status(StatusCodes.BAD_REQUEST).send("Could not find game with provided id");
        }
        const gameId = req.body.gameId;
        const game = GameManagerService.games.get(gameId);
        if (!(game instanceof ClassicGame))
            return res.status(StatusCodes.BAD_REQUEST).send("Game type not valid for current request");
        try {
            game.chooseDrawingName(username, drawingName);
        } catch (e) {
            return res.status(StatusCodes.UNAUTHORIZED).send(e.message);
        }
        next();
    }

    dispatchDrawingEvent(user: BasicUser, event: DrawingEvent){
        if (this.gameExist(event.gameId)) {
            const game: Game =  GameManagerService.games.get(event.gameId);
            (game as ClassicGame).dispatchDrawingEvent(user, event);
        }
        else{
            throw new Error("This game does not exist");
        }
    }

    gameExist(gameId: string): boolean {
        return GameManagerService.games.has(gameId);
    }

    guessDrawing(gameId: string, username: string, guess: string) {
        if (!gameId || !GameManagerService.games.has(gameId)) {
            return;
        }
        let game = GameManagerService.games.get(gameId);
        game.guessDrawing(username, guess);
    }
}