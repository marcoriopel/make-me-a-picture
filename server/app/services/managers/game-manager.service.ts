import { inject, injectable } from 'inversify';
import { LobbyManagerService } from './lobby-manager.service';
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { GameType } from '@app/ressources/variables/game-variables';
import { Game } from '@app/classes/game/game';
import { Lobby } from '@app/classes/lobby/lobby';
import { ClassicGame } from '@app/classes/game/classic-game';



@injectable()
export class GameManagerService {

    static games: Map<string, Game> = new Map<string, Game>();
    constructor() {
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
                const game = new ClassicGame(lobby.getDifficulty(), lobby.getGameName(), lobby.getPlayers());
                console.log(lobby.getPlayers());
                GameManagerService.games.set(req.body.lobbyId, game);
                console.log("here");
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
}