import { DrawingEvent } from '@app/ressources/interfaces/game-events';
import { BasicUser, Player } from '@app/ressources/interfaces/user.interface';
import { Difficulty } from '@app/ressources/variables/game-variables';
import { DrawingsService } from '@app/services/drawings.service';
import { SocketService } from '@app/services/sockets/socket.service';
import { injectable } from 'inversify';
import { CoopLobby } from '../lobby/coop-lobby';
import { Lobby } from '../lobby/lobby';
import { VirtualPlayer } from '../virtual-player/virtual-player';
import { Game } from './game';

@injectable()
export class CoopGame extends Game {
    private players: Map<string, Player> = new Map<string, Player>();
    private vPlayer: VirtualPlayer;
    private score: number = 0;
    private guessesLeft: number = 0;
    private gameTimerCount: number = 0;
    private gameTimerInterval: NodeJS.Timeout;
    private drawingTimerCount: number = 0;
    private drawingTimerInterval: NodeJS.Timeout;
    private currentDrawingName: string;

    constructor(lobby: CoopLobby, socketService: SocketService, private drawingsService: DrawingsService) {
        super(<Lobby>lobby, socketService);
        this.players = lobby.getPlayers();
        this.vPlayer = lobby.getVPlayer();
        console.log("Started classic game with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    async startGame(): Promise<void> {
        this.setGuesses();
        if (this.vPlayer != undefined) {
            this.vPlayer.setServices(this.drawingsService, this.socketService)
        }
        this.socketService.getSocket().to(this.id).emit('score', { "score": this.score });
        this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
        this.currentDrawingName = await this.vPlayer.getNewDrawing(this.difficulty);
        this.startGameTimer();
        this.startDrawingTimer();
        this.vPlayer.startDrawing();
    }

    guessDrawing(username: string, guess: string): void {
        if (!this.players.has(username)) {
            throw Error("User is not part of the game")
        }
        if (this.currentDrawingName == guess) {
            this.addBonusGameTime();
            ++this.score;
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": true, "guessingPlayer": username });
            this.socketService.getSocket().to(this.id).emit('score', { "score": this.score })
            this.vPlayer.stopDrawing();
            this.setupNextDrawing();
        }
        else {
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": false, "guessingPlayer": username })
            --this.guessesLeft;
            if (!this.guessesLeft) {
                this.vPlayer.stopDrawing();
                this.setupNextDrawing();
            }
        }
        this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
    }


    private async setupNextDrawing() {
        clearInterval(this.drawingTimerInterval);
        this.setGuesses();
        this.currentDrawingName = await this.vPlayer.getNewDrawing(this.difficulty);
        this.vPlayer.startDrawing();
        this.startDrawingTimer();

    }

    private endGame(): void {
        clearInterval(this.gameTimerInterval);
        this.guessesLeft = 0;
        this.socketService.getSocket().to(this.id).emit('endGame', { "finalScore": this.score });
        this.socketService.getSocket().to(this.id).emit('message', { "user": { username: "System" }, "text": "La partie est maintenant terminée!", "timeStamp": "timestamp", "textColor": "#2065d4", chatId: this.id });
    }

    getPlayers(): any {
        let players = [];
        this.players.forEach((player: Player) => {
            players.push({ "username": player.username, "avatar": player.avatar });
        })
        return players;
    }

    setGuesses(): void {
        switch (this.difficulty) {
            case Difficulty.EASY:
                this.guessesLeft = 5;
                break;
            case Difficulty.MEDIUM:
                this.guessesLeft = 3;
                break;
            case Difficulty.HARD:
                this.guessesLeft = 2;
                break;
        }
    }

    addBonusGameTime(): void {
        switch (this.difficulty) {
            case Difficulty.EASY:
                this.gameTimerCount += 10;
                break;
            case Difficulty.MEDIUM:
                this.gameTimerCount += 5;
                break;
            case Difficulty.HARD:
                this.gameTimerCount += 3;
                break;
        }
    }

    startGameTimer() {
        this.gameTimerCount = 60;
        this.gameTimerInterval = setInterval(() => {
            this.socketService.getSocket().to(this.id).emit('gameTimer', { "gameTimer": this.gameTimerCount });
            if (!this.gameTimerCount) {
                this.endGame;
            }
            else {
                --this.gameTimerCount;
            }
        }, 1000);
    }

    startDrawingTimer() {
        this.drawingTimerCount = 30;
        this.drawingTimerInterval = setInterval(() => {
            this.socketService.getSocket().to(this.id).emit('drawingTimer', { "drawingTimer": this.drawingTimerCount });
            if (!this.drawingTimerCount) {
                this.setupNextDrawing();
            }
            else {
                --this.drawingTimerCount;
            }
        }, 1000);
    }
}