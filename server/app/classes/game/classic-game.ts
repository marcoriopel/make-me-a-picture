import { DrawingEvent } from '@app/ressources/interfaces/game-events';
import { BasicUser, Player } from '@app/ressources/interfaces/user.interface';
import { Difficulty, GuessTime } from '@app/ressources/variables/game-variables';
import { DrawingsService } from '@app/services/drawings.service';
import { SocketService } from '@app/services/sockets/socket.service';
import { injectable } from 'inversify';
import { ClassicLobby } from '../lobby/classic-lobby';
import { Lobby } from '../lobby/lobby';
import { VirtualPlayer } from '../virtual-player/virtual-player';
import { Game } from './game';

@injectable()
export class ClassicGame extends Game {
    private teams: Map<string, Player>[] = [new Map<string, Player>(), new Map<string, Player>()];
    private vPlayers: VirtualPlayer[] = new Array(2);
    private drawingTeam: number;
    private drawingPlayer: Player[] = new Array(2);
    private score: number[] = [0, 0];
    private guessesLeft: number[] = [0, 0];
    private round: number = 0;
    private currentDrawingName: string;
    private timerCount: number = 0;
    private timerInterval: NodeJS.Timeout;
    private drawingTeamGuessingTime = 0;
    private opposingTeamGuessingTime = 0;

    constructor(lobby: ClassicLobby, socketService: SocketService, private drawingsService: DrawingsService) {
        super(<Lobby>lobby, socketService);
        this.teams = lobby.getTeams();
        this.vPlayers = lobby.getVPlayers();
        console.log("Started classic game with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    async startGame(): Promise<void> {
        this.drawingTeam = this.selectRandomBinary();
        this.setGuesses();
        this.round = 1;
        this.assignRandomDrawingPlayer(0);
        this.assignRandomDrawingPlayer(1);

        for (let vPlayer of this.vPlayers) {
            if (vPlayer != undefined) {
                vPlayer.setServices(this.drawingsService, this.socketService)
            }
        }
        const roundInfoMessage = "C'est au tour de " + this.drawingPlayer[this.drawingTeam].username + " de l'équipe " + this.drawingTeam + " de dessiner";
        this.socketService.getSocket().to(this.id).emit('message', { "user": { username: "System" }, "text": roundInfoMessage, "timeStamp": "timestamp", "textColor": "#2065d4", chatId: this.id });
        this.socketService.getSocket().to(this.id).emit('gameStart', { "player": this.drawingPlayer[this.drawingTeam].username, "teams": this.getPlayers() });
        this.socketService.getSocket().to(this.id).emit('score', { "score": this.score });
        this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
        this.startTimer(true);
        if (this.drawingPlayer[this.drawingTeam].isVirtual) {
            this.currentDrawingName = await this.vPlayers[this.drawingTeam].getNewDrawing(this.difficulty);
            this.vPlayers[this.drawingTeam].startDrawing();
        }
        else {
            this.getDrawingSuggestions();
        }
    }

    async getDrawingSuggestions(): Promise<void> {
        console.log("Sent suggestion to: " + this.drawingPlayer[this.drawingTeam].username);
        let drawingNames;
        try {
            drawingNames = await this.drawingsService.getWordSuggestions(this.difficulty);
            this.currentDrawingName = drawingNames[0];
            this.socketService.getSocket().to(this.drawingPlayer[this.drawingTeam].socketId).emit("drawingName", { "drawingName": drawingNames[0] });
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
    }

    private drawingTeamGuess(username: string, guess: string): void {
        if (!this.guessesLeft[this.drawingTeam]) {
            throw Error("It's not your turn to guess")
        }
        if (this.currentDrawingName == guess) {
            console.log("Drawing team guessed drawing correctly!");
            ++this.score[this.drawingTeam];
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": true, "guessingPlayer": username });
            this.socketService.getSocket().to(this.id).emit('score', { "score": this.score })
            if (this.drawingPlayer[this.drawingTeam].isVirtual) {
                this.vPlayers[this.drawingTeam].stopDrawing();
            }
            this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
            this.setupNextRound();
        }
        else {
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": false, "guessingPlayer": username })
            --this.guessesLeft[this.drawingTeam];
            if (!this.guessesLeft[this.drawingTeam]) {
                this.switchGuessingTeam();
            }
            else {
                this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
            }
        }
    }

    private opposingTeamGuess(username: string, guess: string): void {
        if (!this.guessesLeft[this.getOpposingTeam()]) {
            throw Error("It's not your turn to guess")
        }
        if (this.currentDrawingName == guess) {
            console.log("Opposing team guessed drawing correctly!");
            this.score[this.getOpposingTeam()] += 1;
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": true, "guessingPlayer": username });
            this.socketService.getSocket().to(this.id).emit('score', { "score": this.score });
        }
        else {
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": false, "guessingPlayer": username });
        }
        this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
        this.setupNextRound();
    }

    private switchGuessingTeam() {
        this.guessesLeft[this.getOpposingTeam()] = 1;
        this.guessesLeft[this.drawingTeam] = 0;
        if (this.drawingPlayer[this.drawingTeam].isVirtual) {
            this.vPlayers[this.drawingTeam].stopDrawing();
        }
        this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
        clearInterval(this.timerInterval);
        this.startTimer(false);
    }

    private selectRandomBinary(): number {
        return Math.floor(Math.random() + 0.5);
    }

    private checkIfTeamHasVirtualPlayer(teamNumber: number): boolean {
        let returnValue = false;
        this.teams[teamNumber].forEach((player: Player) => {
            if (player.isVirtual) {
                returnValue = true;
            }
        })
        return returnValue;
    }

    private assignRandomDrawingPlayer(teamNumber: number): void {
        const players: Player[] = Array.from(this.teams[teamNumber].values());
        if (!this.checkIfTeamHasVirtualPlayer(teamNumber)) {
            this.drawingPlayer[teamNumber] = players[this.selectRandomBinary()];
        }
        else {
            if (players[0].isVirtual) {
                this.drawingPlayer[teamNumber] = players[0];
            }
            else {
                this.drawingPlayer[teamNumber] = players[1];
            }
        }
    }

    private async setupNextRound() {
        if (this.round < 4) {
            clearInterval(this.timerInterval);
            ++this.round;
            this.drawingTeam = this.getOpposingTeam();
            this.changeDrawingPlayer();
            this.setGuesses();
            this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft });
            this.socketService.getSocket().to(this.id).emit('newRound', { "newDrawingPlayer": this.drawingPlayer[this.drawingTeam].username });
            this.startTimer(true);
            const roundInfoMessage = "C'est au tour de " + this.drawingPlayer[this.drawingTeam].username + " de l'équipe " + this.drawingTeam + " de dessiner";
            this.socketService.getSocket().to(this.id).emit('message', { "user": { username: "System" }, "text": roundInfoMessage, "timeStamp": "timestamp", "textColor": "#2065d4", chatId: this.id });
            if (this.drawingPlayer[this.drawingTeam].isVirtual) {
                this.currentDrawingName = await this.vPlayers[this.drawingTeam].getNewDrawing(this.difficulty);
                this.vPlayers[this.drawingTeam].startDrawing();
            }
            else {
                this.getDrawingSuggestions();
            }
        }
        else {
            this.endGame();
        }
    }

    private endGame(): void {
        clearInterval(this.timerInterval);
        this.guessesLeft = [0, 0];
        this.socketService.getSocket().to(this.id).emit('endGame', { "finalScore": this.score });
        this.socketService.getSocket().to(this.id).emit('message', { "user": { username: "System" }, "text": "La partie est maintenant terminée!", "timeStamp": "timestamp", "textColor": "#2065d4", chatId: this.id });
    }

    private getOpposingTeam(): number {
        if (this.drawingTeam)
            return 0;
        else
            return 1;
    }

    getPlayers(): any {
        let players = [];
        for (let i = 0; i < this.teams.length; ++i) {
            this.teams[i].forEach((player: Player) => {
                players.push({ "username": player.username, "avatar": player.avatar, "team": i, "isVirtual": player.isVirtual });
            })
        }
        return players;
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
        this.opposingTeamGuessingTime = 10;
        this.guessesLeft[this.drawingTeam] = 1;
        switch (this.difficulty) {
            case Difficulty.EASY:
                this.drawingTeamGuessingTime = GuessTime.EASY;
                break;
            case Difficulty.MEDIUM:
                this.drawingTeamGuessingTime = GuessTime.MEDIUM;
                break;
            case Difficulty.HARD:
                this.drawingTeamGuessingTime = GuessTime.HARD;
                break;
        }
        this.guessesLeft[this.getOpposingTeam()] = 0;
    }

    startTimer(isDrawingTeam: boolean) {
        this.timerCount = isDrawingTeam ? this.drawingTeamGuessingTime : this.opposingTeamGuessingTime;
        this.timerInterval = setInterval(() => {
            this.socketService.getSocket().to(this.id).emit('timer', { "timer": this.timerCount });
            if (!this.timerCount) {
                isDrawingTeam ? this.switchGuessingTeam() : this.setupNextRound();
            }
            else {
                --this.timerCount;
            }
        }, 1000);
    }
}