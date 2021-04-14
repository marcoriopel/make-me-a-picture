import { DrawingEvent } from '@app/ressources/interfaces/game-events';
import { BasicUser, Player } from '@app/ressources/interfaces/user.interface';
import { Difficulty, drawingEventType, GuessTime } from '@app/ressources/variables/game-variables';
import { DrawingsService } from '@app/services/drawings.service';
import { ChatManagerService } from '@app/services/managers/chat-manager.service';
import { SocketService } from '@app/services/sockets/socket.service';
import { StatsService } from '@app/services/stats.service';
import { UserService } from '@app/services/user.service';
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
    private pastVirtualDrawings: string[] = [];
    private pastVirtualDrawingsId: string[] = [];
    private gameTimerCount: number = 0;
    private transitionInterval: NodeJS.Timeout;
    private gameTimerInterval: NodeJS.Timeout;
    private drawingTimerCount: number = 0;
    private transitionTimerCount: number = 5;
    private drawingTimerInterval: NodeJS.Timeout;
    private currentDrawingName: string;
    private startDate: number;
    private endDate: number;

    constructor(
        lobby: CoopLobby,
        socketService: SocketService,
        private drawingsService: DrawingsService,
        private statsService: StatsService,
        private userService: UserService,
        private chatManagerService: ChatManagerService) {
        super(<Lobby>lobby, socketService);
        for (let player of lobby.getPlayers()) {
            this.players.set(player.username, player);
        }
        this.vPlayer = lobby.getVPlayer();
        console.log("Started coop game with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    async startGame(): Promise<void> {
        this.startDate = new Date().getTime();
        this.setGuesses();
        this.vPlayer.setServices(this.drawingsService, this.socketService, this.userService)
        await this.vPlayer.setTeammates(this.getPlayers());
        this.vPlayer.sayHelloMany();
        this.socketService.getSocket().to(this.id).emit('gameStart', { "player": this.vPlayer.getBasicUser().username });
        this.socketService.getSocket().to(this.id).emit('score', { "score": this.score });
        this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
        const drawing = await (await this.vPlayer.getNewDrawing(this.difficulty, this.pastVirtualDrawings));
        this.currentDrawingName = drawing.drawingName;
        this.pastVirtualDrawingsId.push(drawing.drawingId);
        this.pastVirtualDrawings.push(drawing.drawingName);
        this.startGameTransition();
    }

    startGameTransition() {
        this.transitionInterval = setInterval(() => {
            this.socketService.getSocket().to(this.id).emit('transitionTimer', { "timer": this.transitionTimerCount });
            if (!this.transitionTimerCount) {
                this.startGameTimer();
                this.startDrawingTimer();
                this.vPlayer.startDrawing();
            }
            else {
                --this.transitionTimerCount;
            }
        }, 1000);

    }

    guessDrawing(username: string, guess: string): void {
        if (!this.players.has(username)) {
            throw Error("User is not part of the game")
        }
        if (this.currentDrawingName == guess) {
            this.addBonusGameTime();
            ++this.score;
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": true, "guessingPlayer": username });
            this.vPlayer.sayRightGuess();
            this.socketService.getSocket().to(this.id).emit('score', { "score": this.score })
            this.setupNextDrawing();
        }
        else {
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": false, "guessingPlayer": username })
            --this.guessesLeft;
            if (!this.guessesLeft) {
                this.vPlayer.sayWrongGuess();
                this.setupNextDrawing();
            }
            else {
                this.vPlayer.sayWrongTry();
            }
        }
        this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
    }


    private async setupNextDrawing() {
        this.vPlayer.stopDrawing();
        clearInterval(this.drawingTimerInterval);
        this.setGuesses();
        this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
        let drawing;
        try {
            drawing = await (await this.vPlayer.getNewDrawing(this.difficulty, this.pastVirtualDrawings));
        } catch (err) {
            if (err.message == "Max drawings") {
                this.socketService.getSocket().to(this.id).emit('maxScore', {});
                this.endGame();
                return;
            }
        }
        this.currentDrawingName = drawing.drawingName;
        this.pastVirtualDrawingsId.push(drawing.drawingId);
        this.pastVirtualDrawings.push(drawing.drawingName);
        this.socketService.getSocket().to(this.id).emit('newRound', {})
        await this.delay();
        this.vPlayer.startDrawing();
        this.startDrawingTimer();
    }

    delay = () => new Promise(res => setTimeout(res, 500));

    private endGame(): void {
        if(this.isGameEnded){
            return;
        }
        else{
            this.isGameEnded = true;
            this.gameEnded.next(true);
            this.endDate = new Date().getTime();
            clearInterval(this.gameTimerInterval);
            clearInterval(this.drawingTimerInterval);
            this.guessesLeft = 0;
            this.vPlayer.stopDrawing();
            this.vPlayer.sayEndCoopGame(this.score);
            this.socketService.getSocket().to(this.id).emit('endGame', { "finalScore": this.score, "virtualPlayerDrawings": this.pastVirtualDrawings, "virtualPlayerIds": this.pastVirtualDrawingsId });
            this.socketService.getSocket().to(this.id).emit('message', { "user": { username: "System", avatar: -1 }, "text": "La partie est maintenant terminée!", "timestamp": 0, "textColor": "#2065d4", chatId: this.id });
            this.statsService.updateStats(this.gameName, this.gameType, this.getPlayers(), [this.score], this.startDate, this.endDate);
            this.chatManagerService.deleteChat(this.id);
        }
    }

    getPlayers(): any {
        let players = [];
        this.players.forEach((player: Player) => {
            players.push({ "username": player.username, "avatar": player.avatar });
        })
        players.push(this.vPlayer.getBasicUser());
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
        clearInterval(this.transitionInterval);
        this.gameTimerCount = 120;
        this.gameTimerInterval = setInterval(() => {
            this.socketService.getSocket().to(this.id).emit('gameTimer', { "timer": this.gameTimerCount });
            if (!this.gameTimerCount) {
                this.endGame();
            }
            else {
                --this.gameTimerCount;
            }
        }, 1000);
    }

    startDrawingTimer() {
        switch (this.difficulty) {
            case Difficulty.EASY:
                this.drawingTimerCount = GuessTime.EASY;
                break;
            case Difficulty.MEDIUM:
                this.drawingTimerCount = GuessTime.MEDIUM;
                break;
            case Difficulty.HARD:
                this.drawingTimerCount = GuessTime.HARD;
                break;
        }
        this.drawingTimerInterval = setInterval(() => {
            this.socketService.getSocket().to(this.id).emit('drawingTimer', { "timer": this.drawingTimerCount });
            if (!this.drawingTimerCount) {
                this.setupNextDrawing();
            }
            else {
                --this.drawingTimerCount;
            }
        }, 1000);
    }


    disconnectGame(username: string) {
        const message: string = username + " s'est déconnecté";
        this.socketService.getSocket().to(this.id).emit('message', { "user": { username: "System", avatar: -1 }, "text": message, "timestamp": 0, "textColor": "#2065d4", chatId: this.id });

    }

    requestHint(user: BasicUser): void {
        this.vPlayer.sendNextHint();
    }


}