import { Drawing } from '@app/ressources/interfaces/drawings.interface';
import { DrawingEvent } from '@app/ressources/interfaces/game-events';
import { BasicUser, Player } from '@app/ressources/interfaces/user.interface';
import { GameType } from '@app/ressources/variables/game-variables';
import { DrawingsService } from '@app/services/drawings.service';
import { SocketService } from '@app/services/sockets/socket.service';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { ClassicLobby } from '../lobby/classic-lobby';
import { Lobby } from '../lobby/lobby';
import { VirtualPlayer } from '../virtual-player/virtual-player';
import { Game } from './game';
import { Difficulty } from '@app/ressources/variables/game-variables'

@injectable()
export class ClassicGame extends Game {
    private teams: Map<string, Player>[] = [new Map<string, Player>(), new Map<string, Player>()];
    private drawingTeam: number;
    private drawingPlayer: Player[] = new Array(2);
    private score: number[] = [0, 0];
    private guessesLeft: number[] = [0, 0];
    private round: number = 0;
    private currentDrawingName: string;

    constructor(lobby: ClassicLobby, socketService: SocketService, private drawingsService: DrawingsService) {
        super(<Lobby>lobby, socketService);
        this.teams = lobby.getTeams();
        console.log("Started classic game with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    startGame(): void {
        this.drawingTeam = this.selectRandomBinary();
        this.setGuesses();
        this.round = 1;
        this.assignRandomDrawingPlayer(0);
        this.assignRandomDrawingPlayer(1);
        this.socketService.getSocket().to(this.id).emit('gameStart', { "player": this.drawingPlayer[this.drawingTeam].username });
        this.socketService.getSocket().to(this.id).emit('score', { "score": this.score });
        this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
        this.getDrawingSuggestions();
    }

    async getDrawingSuggestions(): Promise<void> {
        console.log("Sent suggestion to: " + this.drawingPlayer[this.drawingTeam].username);
        let drawingNames;
        try {
            drawingNames = await this.drawingsService.getWordSuggestions(this.difficulty);
            this.currentDrawingName = drawingNames[0];
            this.socketService.getSocket().to(this.drawingPlayer[this.drawingTeam].socketId).emit('drawingName', { "drawingName": drawingNames[0] });
        } catch (e) {
            this.socketService.getSocket().to(this.drawingPlayer[this.drawingTeam].socketId).emit('error', { "error": e.message });
        }
    }

    guessDrawing(username: string, guess: string): void {
        console.log("Guessed " + guess)
        if (this.drawingPlayer[this.drawingTeam].username == username)
            throw Error("Drawing player can not guess his own word")
        if (this.teams[this.drawingTeam].get(username)) {
            this.drawingTeamGuess(username, guess);
        }
        else if (this.teams[this.getOpposingTeam()].get(username)) {
            this.opposingTeamGuess(username, guess);
        }
        else {
            throw Error("User is not part of the game")
        }
        this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
    }

    private drawingTeamGuess(username: string, guess: string): void {
        if (!this.guessesLeft[this.drawingTeam]) {
            throw Error("It's not your turn to guess")
        }
        if (this.currentDrawingName == guess) {
            console.log("Drawing team guessed drawing correctly!")
            this.score[this.drawingTeam] += 1;
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": true, "guessingPlayer": username });
            this.socketService.getSocket().to(this.id).emit('score', { "score": this.score })
            this.setupNextRound();
        }
        else {
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": false, "guessingPlayer": username })
            --this.guessesLeft[this.drawingTeam];
            if (!this.guessesLeft[this.drawingTeam]) {
                this.guessesLeft[this.getOpposingTeam()] = 1;
            }
        }
    }

    private opposingTeamGuess(username: string, guess: string): void {
        if (!this.guessesLeft[this.getOpposingTeam()]) {
            throw Error("It's not your turn to guess")
        }
        if (this.currentDrawingName == guess) {
            "Opposing team guessed drawing correctly!"
            this.score[this.getOpposingTeam()] += 1;
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": true, "guessingPlayer": username });
            this.socketService.getSocket().to(this.id).emit('score', { "score": this.score })
        }
        else {
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": false, "guessingPlayer": username });
        }
        this.setupNextRound();
    }

    private selectRandomBinary(): number {
        return Math.floor(Math.random() + 0.5);
    }

    private checkIfTeamHasVirtualPlayer(teamNumber: number): boolean {
        this.teams[teamNumber].forEach((player: Player) => {
            if (player.isVirtual)
                return true;
        })
        return false;
    }

    private assignRandomDrawingPlayer(teamNumber: number): void {
        const players: Player[] = Array.from(this.teams[teamNumber].values());

        if (!this.checkIfTeamHasVirtualPlayer(teamNumber)) {
            this.drawingPlayer[teamNumber] = players[this.selectRandomBinary()];
        }
        else {
            if (players[0].isVirtual) {
                this.drawingPlayer[teamNumber] = players[1];
            }
            else {
                this.drawingPlayer[teamNumber] = players[0];
            }
        }
    }

    private setupNextRound(): void {
        if (this.round < 4) {
            ++this.round;
            this.drawingTeam = this.getOpposingTeam();
            this.changeDrawingPlayer();
            this.setGuesses();
            this.socketService.getSocket().to(this.id).emit('newRound', { "newDrawingPlayer": this.drawingPlayer[this.drawingTeam].username });
            this.getDrawingSuggestions();
        }
        else {
            this.endGame()
        }
    }

    private endGame(): void {
        this.guessesLeft = [0, 0];
        this.socketService.getSocket().to(this.id).emit('endGame', { "finalScore": this.score });
    }

    private getOpposingTeam(): number {
        if (this.drawingTeam)
            return 0;
        else
            return 1;
    }

    private changeDrawingPlayer(): void {
        const players: Player[] = Array.from(this.teams[this.drawingTeam].values());

        if (!this.checkIfTeamHasVirtualPlayer(this.drawingTeam)) {
            if (players[0].username == this.drawingPlayer[this.drawingTeam].username)
                this.drawingPlayer[this.drawingTeam] = players[1];
            else
                this.drawingPlayer[this.drawingTeam] = players[0];
        }
    }

    chooseDrawingName(username: string, drawingName: string): void {
        if (this.drawingPlayer[this.drawingTeam].username != username)
            throw new Error("User not authorized to select drawing name");
        this.currentDrawingName = drawingName;
    }

    dispatchDrawingEvent(user: BasicUser, event: DrawingEvent): void {
        if (user.username == this.drawingPlayer[this.drawingTeam].username) {
            this.socketService.getSocket().to(this.id).emit('drawingEvent', { "drawingEvent": event });
        }
        else {
            throw new Error("It is not your turn to draw");
        }
    }

    setGuesses(): void {
        switch (this.difficulty) {
            case Difficulty.EASY:
                this.guessesLeft[this.drawingTeam] = 3;
                break;
            case Difficulty.MEDIUM:
                this.guessesLeft[this.drawingTeam] = 2;
                break;
            case Difficulty.HARD:
                this.guessesLeft[this.drawingTeam] = 1;
                break;
        }
        this.guessesLeft[this.getOpposingTeam()] = 0;
    }
}