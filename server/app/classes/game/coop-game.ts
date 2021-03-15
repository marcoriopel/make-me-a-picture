import { DrawingEvent } from '@app/ressources/interfaces/game-events';
import { BasicUser, Player } from '@app/ressources/interfaces/user.interface';
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
    private round: number = 0;
    private currentDrawingName: string;

    constructor(lobby: CoopLobby, socketService: SocketService, private drawingsService: DrawingsService) {
        super(<Lobby>lobby, socketService);
        this.players = lobby.getPlayers();
        this.vPlayer = lobby.getVPlayer();
        console.log("Started classic game with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    async startGame(): Promise<void> {
        this.setGuesses();
        this.round = 1;
        if (this.vPlayer != undefined) {
            this.vPlayer.setServices(this.drawingsService, this.socketService)
        }
        this.socketService.getSocket().to(this.id).emit('score', { "score": this.score });
        this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
        this.currentDrawingName = await this.vPlayer.getNewDrawing(this.difficulty);
        this.vPlayer.startDrawing();
    }

    guessDrawing(username: string, guess: string): void {
        if (this.players.has(username)) {
            this.drawingTeamGuess(username, guess);
        }
        this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
    }

    private drawingTeamGuess(username: string, guess: string): void {
        if (this.currentDrawingName == guess) {
            ++this.score;
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": true, "guessingPlayer": username });
            this.socketService.getSocket().to(this.id).emit('score', { "score": this.score })
            this.vPlayer.stopDrawing();
            this.setupNextRound();
        }
        else {
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": false, "guessingPlayer": username })
            --this.guessesLeft;
            if (!this.guessesLeft) {
                this.vPlayer.stopDrawing();
                this.setupNextRound();
            }
        }
    }

    private selectRandomBinary(): number {
        return Math.floor(Math.random() + 0.5);
    }

    private async setupNextRound() {
        if (this.round < 4) {
            ++this.round;
            this.setGuesses();
            this.socketService.getSocket().to(this.id).emit('round', { "round": this.round });
            this.currentDrawingName = await this.vPlayer.getNewDrawing(this.difficulty);
            this.vPlayer.startDrawing();
        }
        else {
            this.endGame();
        }
    }

    private endGame(): void {
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
        this.guessesLeft = 3;
    }
}