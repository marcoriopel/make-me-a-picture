import { FeedImage } from '@app/ressources/interfaces/drawings.interface';
import { DrawingEvent } from '@app/ressources/interfaces/game-events';
import { BasicUser, Player } from '@app/ressources/interfaces/user.interface';
import { Difficulty, drawingEventType, GuessTime, transitionType } from '@app/ressources/variables/game-variables';
import { DrawingsService } from '@app/services/drawings.service';
import { ChatManagerService } from '@app/services/managers/chat-manager.service';
import { SocketService } from '@app/services/sockets/socket.service';
import { StatsService } from '@app/services/stats.service';
import { UserService } from '@app/services/user.service';
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
    private pastVirtualDrawings: string[] = [];
    private pastVirtualDrawingsId: string[] = [];
    private timerCount: number = 0;
    private timerInterval: NodeJS.Timeout;
    private transitionInterval: NodeJS.Timeout;
    private transitionTimerCount: number = 5;
    private drawingTeamGuessingTime = 0;
    private opposingTeamGuessingTime = 0;
    private startDate: number;
    private endDate: number;
    private gameImagesUrl: FeedImage[] = [];

    constructor(
        lobby: ClassicLobby,
        socketService: SocketService,
        private drawingsService: DrawingsService,
        private statsService: StatsService,
        private userService: UserService,
        private chatManagerService: ChatManagerService) {
        super(<Lobby>lobby, socketService);
        this.teams = lobby.getTeams();
        this.vPlayers = lobby.getVPlayers();
        console.log("Started classic game with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    async startGame(): Promise<void> {
        this.startDate = new Date().getTime();
        this.drawingTeam = this.selectRandomBinary();
        this.setGuesses();
        this.round = 1;
        this.assignRandomDrawingPlayer(0);
        this.assignRandomDrawingPlayer(1);
        await this.setupVPlayers();
        for (const vPlayer of this.vPlayers) {
            if (vPlayer) {
                vPlayer.sayHello();
            }
        }
        const roundInfoMessage = "C'est au tour de " + this.drawingPlayer[this.drawingTeam].username + " de l'équipe " + (this.drawingTeam + 1) + " de dessiner";
        this.socketService.getSocket().to(this.id).emit('message', { "user": { username: "System", avatar: -1 }, "text": roundInfoMessage, "timestamp": 0, "textColor": "#000000", chatId: this.id });
        const basicUser = { username: "System", avatar: -1 };
        const incomingMessage = {
            token: "0",
            text: roundInfoMessage,
            chatId: this.id
        }
        const date = new Date();
        date.setTime(0);
        this.chatManagerService.addMessageToDB(basicUser, incomingMessage, date);
        this.socketService.getSocket().to(this.id).emit('gameStart', { "player": this.drawingPlayer[this.drawingTeam].username, "teams": this.getPlayers() });
        this.socketService.getSocket().to(this.id).emit('score', { "score": this.score });
        this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft });
        this.gameTransition(transitionType.GAMESTART);
    }

    gameTransition(type: number) {
        this.transitionInterval = setInterval(() => {
            this.socketService.getSocket().to(this.id).emit('transitionTimer', { "timer": this.transitionTimerCount, "state": type });
            if (!this.transitionTimerCount) {
                switch (type) {
                    case transitionType.GAMESTART:
                        this.startDrawing();
                        break;
                    case transitionType.OPPOSITION:
                        this.opposingTeamTurnStart();
                        break;
                    case transitionType.NEWROUND:
                        this.sendNextRoundInfo();
                        break;
                }
            }
            else {
                --this.transitionTimerCount;
            }
        }, 1000);
    }

    async startDrawing(): Promise<void> {
        clearInterval(this.transitionInterval);
        this.transitionTimerCount = 5;
        if (this.drawingPlayer[this.drawingTeam].isVirtual) {
            this.startTimer(true);
            const drawing = await (await this.vPlayers[this.drawingTeam].getNewDrawing(this.difficulty, this.pastVirtualDrawings));
            this.currentDrawingName = drawing.drawingName;
            this.pastVirtualDrawingsId.push(drawing.drawingId);
            this.pastVirtualDrawings.push(drawing.drawingName);
            this.vPlayers[this.drawingTeam].startDrawing();
        }
        else {
            this.getDrawingSuggestions();
        }
    }

    async validateDrawingPlayer(username: string) {
        return this.drawingPlayer[this.drawingTeam].username == username ? true : false;
    }
    async getDrawingSuggestions(): Promise<void> {
        let drawingNames;
        try {
            drawingNames = await this.drawingsService.getWordSuggestions(this.difficulty);
            this.socketService.getSocket().to(this.drawingPlayer[this.drawingTeam].socketId).emit("drawingSuggestions", { "drawingNames": drawingNames });
        } catch (e) {
            this.socketService.getSocket().to(this.drawingPlayer[this.drawingTeam].socketId).emit('error', { "error": e.message });
        }
    }

    guessDrawing(username: string, guess: string): void {
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
        if (this.currentDrawingName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() == guess.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()) {
            console.log("Drawing team guessed drawing correctly!");
            ++this.score[this.drawingTeam];
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": true, "guessingPlayer": username });
            if (this.vPlayers[this.drawingTeam]) {
                this.vPlayers[this.drawingTeam].sayRightGuess();
            }
            const drawingEvent: DrawingEvent = {
                eventType: drawingEventType.MOUSEUP,
                event: { x: 0, y: 0 },
                gameId: this.id,
            }
            this.socketService.getSocket().to(this.id).emit('drawingEvent', { "drawingEvent": drawingEvent });
            this.socketService.getSocket().to(this.id).emit('score', { "score": this.score })
            if (this.drawingPlayer[this.drawingTeam].isVirtual) {
                this.vPlayers[this.drawingTeam].stopDrawing();
            }
            this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
            this.setupNextRound();
        }
        else {
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": false, "guessingPlayer": username })
            if (this.vPlayers[this.drawingTeam]) {
                this.vPlayers[this.drawingTeam].sayWrongGuess();
            }
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
        if (this.currentDrawingName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() == guess.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()) {
            console.log("Opposing team guessed drawing correctly!");
            this.score[this.getOpposingTeam()] += 1;
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": true, "guessingPlayer": username });
            if (this.vPlayers[this.getOpposingTeam()]) {
                this.vPlayers[this.getOpposingTeam()].sayRightGuess();
            }
            this.socketService.getSocket().to(this.id).emit('score', { "score": this.score });
        }
        else {
            this.socketService.getSocket().to(this.id).emit('guessCallback', { "isCorrectGuess": false, "guessingPlayer": username });
            if (this.vPlayers[this.getOpposingTeam()]) {
                this.vPlayers[this.getOpposingTeam()].sayWrongGuess();
            }
        }
        const drawingEvent: DrawingEvent = {
            eventType: drawingEventType.MOUSEUP,
            event: { x: 0, y: 0 },
            gameId: this.id,
        }
        this.socketService.getSocket().to(this.id).emit('drawingEvent', { "drawingEvent": drawingEvent });
        this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
        this.setupNextRound();
    }

    private switchGuessingTeam() {
        clearInterval(this.timerInterval);
        this.guessesLeft[this.getOpposingTeam()] = 1;
        this.guessesLeft[this.drawingTeam] = 0;
        if (this.drawingPlayer[this.drawingTeam].isVirtual) {
            this.vPlayers[this.drawingTeam].stopDrawing();
        }
        this.gameTransition(transitionType.OPPOSITION);
    }

    private opposingTeamTurnStart() {
        clearInterval(this.transitionInterval);
        this.transitionTimerCount = 5;
        this.socketService.getSocket().to(this.id).emit('guessesLeft', { "guessesLeft": this.guessesLeft })
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
            this.gameTransition(transitionType.NEWROUND);
        }
        else {
            this.endGame();
        }
    }


    async sendNextRoundInfo() {
        clearInterval(this.transitionInterval);
        this.transitionTimerCount = 5;
        const roundInfoMessage = "C'est au tour de " + this.drawingPlayer[this.drawingTeam].username + " de l'équipe " + (this.drawingTeam + 1) + " de dessiner";
        this.socketService.getSocket().to(this.id).emit('message', { "user": { username: "System", avatar: -1 }, "text": roundInfoMessage, "timestamp": 0, "textColor": "#000000", chatId: this.id });
        const basicUser = { username: "System", avatar: -1 };
        const incomingMessage = {
            token: "0",
            text: roundInfoMessage,
            chatId: this.id
        }
        const date = new Date();
        date.setTime(0);
        this.chatManagerService.addMessageToDB(basicUser, incomingMessage, date);
        if (this.drawingPlayer[this.drawingTeam].isVirtual) {
            this.startTimer(true);
            const drawing = await (await this.vPlayers[this.drawingTeam].getNewDrawing(this.difficulty, this.pastVirtualDrawings));
            this.currentDrawingName = drawing.drawingName;
            this.pastVirtualDrawingsId.push(drawing.drawingId);
            this.pastVirtualDrawings.push(drawing.drawingName);
            this.vPlayers[this.drawingTeam].startDrawing();
        }
        else {
            this.getDrawingSuggestions();
        }
    }

    private endGame(): void {
        if (this.isGameEnded) {
            return;
        }
        else {
            this.isGameEnded = true;
            this.gameEnded.next(true);
            this.endDate = new Date().getTime();
            clearInterval(this.timerInterval);
            this.guessesLeft = [0, 0];
            this.sendVPlayerEndGameMessage();
            this.uploadRandomFeedImage();
            this.socketService.getSocket().to(this.id).emit('endGame', { "finalScore": this.score, "virtualPlayerDrawings": this.pastVirtualDrawings, "virtualPlayerIds": this.pastVirtualDrawingsId });
            this.socketService.getSocket().to(this.id).emit('message', { "user": { username: "System", avatar: -1 }, "text": "La partie est maintenant terminée!", "timestamp": 0, "textColor": "#000000", chatId: this.id });
            const basicUser = { username: "System", avatar: -1 };
            const incomingMessage = {
                token: "0",
                text: "La partie est maintenant terminée!",
                chatId: this.id
            }
            const date = new Date();
            date.setTime(0);
            this.chatManagerService.addMessageToDB(basicUser, incomingMessage, date);

            this.statsService.updateStats(this.gameName, this.gameType, this.getPlayers(), this.score, this.startDate, this.endDate);
            this.chatManagerService.deleteChat(this.id);
        }
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
        if (this.drawingPlayer[this.drawingTeam].username != username) {
            throw new Error("User not authorized to select drawing name");
        }
        try {
            this.socketService.getSocket().to(this.drawingPlayer[this.drawingTeam].socketId).emit("drawingName", { "drawingName": drawingName });
        } catch (e) {
            this.socketService.getSocket().to(this.drawingPlayer[this.drawingTeam].socketId).emit('error', { "error": e.message });
        }
        this.currentDrawingName = drawingName;
        this.startTimer(true);
    }

    dispatchDrawingEvent(user: BasicUser, event: DrawingEvent): void {
        this.socketService.getSocket().to(this.id).emit('drawingEvent', { "drawingEvent": event });
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
                clearInterval(this.timerInterval);
                isDrawingTeam ? this.switchGuessingTeam() : this.setupNextRound();
            }
            else {
                --this.timerCount;
            }
        }, 1000);
    }

    requestHint(user: BasicUser): void {
        if (this.drawingPlayer[this.drawingTeam].username == user.username)
            throw Error("Drawing player can not guess his own word");
        if (this.teams[this.drawingTeam].get(user.username)) {
            if (!this.guessesLeft[this.drawingTeam]) {
                throw Error("It's not your turn to guess");
            }
            this.vPlayers[this.drawingTeam].sendNextHint();
        }
        else if (this.teams[this.getOpposingTeam()].get(user.username)) {
            throw Error("Users from opposing team cannot ask for hints");
        }
        else {
            throw Error("User is not part of the game");
        }
    }

    disconnectGame(username: string) {
        if (this.teams[0].has(username)) {
            this.score[0] = 0;
        }
        else if (this.teams[1].has(username)) {
            this.score[1] = 0;
        }
        this.socketService.getSocket().to(this.id).emit('userDisconnect', { "username": username });
        this.endGame();
    }

    sendVPlayerEndGameMessage() {
        const maxScoreIndex = this.score.indexOf(Math.max(...this.score));
        const minScoreIndex = this.score.indexOf(Math.min(...this.score));
        if (maxScoreIndex == minScoreIndex) {
            if (this.vPlayers[maxScoreIndex]) {
                this.vPlayers[maxScoreIndex].sayWeTied();
            }
            if (this.vPlayers[minScoreIndex]) {
                this.vPlayers[minScoreIndex].sayWeTied();
            }
        } else {
            if (this.vPlayers[maxScoreIndex]) {
                this.vPlayers[maxScoreIndex].sayWeWon();
            }
            if (this.vPlayers[minScoreIndex]) {
                this.vPlayers[minScoreIndex].sayWeLost();
            }
        }
    }

    async setupVPlayers() {
        for (let i = 0; i < this.vPlayers.length; ++i) {
            if (this.vPlayers[i]) {
                this.vPlayers[i].setServices(this.drawingsService, this.socketService, this.userService, this.chatManagerService);
                for (let player of this.teams[i].values()) {
                    if (player.username != this.vPlayers[i].getBasicUser().username) {
                        await this.vPlayers[i].setTeammates(player);
                    }
                }
            }
        }
    }

    addGameImageUrl(user: BasicUser, imageUrl: string) {
        const feedImage: FeedImage = {
            imageURL: imageUrl,
            timestamp: new Date().getTime(),
            user: user,
        };
        this.gameImagesUrl.push(feedImage);
    }

    uploadRandomFeedImage() {
        if (this.gameImagesUrl.length) {
            const image = this.gameImagesUrl[Math.floor(Math.random() * (this.gameImagesUrl.length - 1))]
            this.drawingsService.uploadImage(image);
        }
    }
}