import { Drawing, Vec2 } from '@app/ressources/interfaces/drawings.interface';
import { DrawingEvent, MouseDown } from '@app/ressources/interfaces/game-events';
import { BasicUser, Player } from '@app/ressources/interfaces/user.interface';
import { Difficulty, drawingEventType, GuessTime } from '@app/ressources/variables/game-variables';
import { DrawingsService } from '@app/services/drawings.service';
import { ChatManagerService } from '@app/services/managers/chat-manager.service';
import { SocketService } from '@app/services/sockets/socket.service';
import { UserService } from '@app/services/user.service';
import { injectable } from 'inversify';

@injectable()
export class VirtualPlayer {
    protected personnality: number;
    protected username: string;
    protected avatar: number;
    protected teammates: string[] = undefined;
    protected lastMutualGames: any = [];
    protected teammatesStats: any = [];
    private drawingsService: DrawingsService;
    protected socketService: SocketService;
    protected userService: UserService;
    protected chatManagerService: ChatManagerService;
    private currentDrawing: Drawing;
    protected gameId: string;
    protected gameType: number;
    private isVPlayerTurn: boolean = false;
    private drawingSpeed: number;
    private nextHintIndex = 0;


    constructor(gameId: string, gameType: number) {
        this.gameId = gameId;
        this.gameType = gameType;
    }

    setServices(drawingsService: DrawingsService, socketService: SocketService, userService: UserService, chatManagerService: ChatManagerService): void {
        this.drawingsService = drawingsService;
        this.socketService = socketService;
        this.userService = userService;
        this.chatManagerService = chatManagerService;
    }

    async getNewDrawing(difficulty: number, pastDrawingNames: string[]): Promise<Drawing> {
        try {
            this.currentDrawing = await this.drawingsService.getRandomDrawing(difficulty, pastDrawingNames);
            this.drawingSpeed = this.calculateDrawingSpeed();
            return this.currentDrawing;
        }
        catch (err) {
            throw err;
        }
    }

    stopDrawing() {
        this.isVPlayerTurn = false;
    }

    async startDrawing() {
        this.nextHintIndex = 0;
        this.isVPlayerTurn = true;
        await this.wait(500)
        this.socketService.getSocket().to(this.gameId).emit('eraserStrokes', { "eraserStrokes": this.currentDrawing.eraserStrokes });
        for (let stroke of this.currentDrawing.pencilStrokes) {
            const mouseDown: MouseDown = {
                coords: stroke.path[0],
                lineColor: stroke.lineColor,
                lineWidth: stroke.lineWidth,
                strokeNumber: stroke.strokeNumber,
            }
            const drawingEvent: DrawingEvent = {
                eventType: drawingEventType.MOUSEDOWN,
                event: mouseDown,
                gameId: this.gameId,
            }
            if (this.isVPlayerTurn) {
                this.socketService.getSocket().to(this.gameId).emit('drawingEvent', { "drawingEvent": drawingEvent });
                await this.drawStroke(stroke.path);
            }
            else {
                return
            }
        }
    }

    async drawStroke(path: Vec2[]) {
        for (let point of path) {
            let isLastPoint: boolean = point == path[path.length - 1] ? true : false;
            if (this.isVPlayerTurn) {
                await this.drawPoint(point, isLastPoint);
            }
            else {
                return
            }
        }
    }

    async drawPoint(point: Vec2, isLastPoint: boolean) {
        let eventType: number = isLastPoint ? drawingEventType.MOUSEUP : drawingEventType.MOUSEMOVE;
        const drawingEvent: DrawingEvent = {
            eventType: eventType,
            event: point,
            gameId: this.gameId,
        }
        this.socketService.getSocket().to(this.gameId).emit('drawingEvent', { "drawingEvent": drawingEvent });
        await this.delay();
    }

    delay = () => new Promise(res => setTimeout(res, this.drawingSpeed))
    wait = ms => new Promise(resolve => setTimeout(resolve, ms))

    private calculateDrawingSpeed(): number {
        let drawingSpeed = 0;
        let pointsNumber: number = this.calculatePointsInDrawing();
        switch (this.currentDrawing.difficulty) {
            case Difficulty.EASY:
                drawingSpeed = GuessTime.EASY * 1000 / pointsNumber;
                break;
            case Difficulty.MEDIUM:
                drawingSpeed = GuessTime.MEDIUM * 1000 / pointsNumber;
                break;
            case Difficulty.HARD:
                drawingSpeed = GuessTime.HARD * 1000 / pointsNumber;
                break;
        }
        return drawingSpeed;
    }

    private calculatePointsInDrawing(): number {
        let pointsNumber = 0;
        for (let stroke of this.currentDrawing.pencilStrokes) {
            for (let { } of stroke.path) {
                ++pointsNumber;
            }
        }
        return pointsNumber;
    }

    getBasicUser(): BasicUser {
        return { "username": this.username, "avatar": this.avatar }
    }

    sendNextHint() {
        if (this.nextHintIndex >= this.currentDrawing.hints.length) {
            this.socketService.getSocket().to(this.gameId).emit('hintError', { "message": "No more hints left" });
        }
        else {
            const timestamp = new Date();
            const message = "Indice: " + this.currentDrawing.hints[this.nextHintIndex];
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
            this.nextHintIndex++;
        }
    }

    async setTeammates(players: any) {
        if (Array.isArray(players)) {
            players.pop();
            this.teammates = [];
            for (let player of players) {
                this.teammates.push(player.username)
            }
        }
        else {
            this.teammates = [players.username];
        }
        await this.setLastMutualGames();
        await this.setTeamatesStats();
    }

    async setLastMutualGames() {
        for (let teammate of this.teammates) {
            let lastMutualGame = await this.userService.getLastMutualGame(teammate, this.username);
            this.lastMutualGames.push(lastMutualGame);
        }
    }

    async setTeamatesStats() {
        for (let teammate of this.teammates) {
            let teammateStats = await this.userService.getUserStats(teammate);
            this.teammatesStats.push(teammateStats);
        }
    }

    sayHello() { }

    sayHelloMany() { }

    sayRightGuess() { }

    sayWrongGuess() { }

    sayWrongTry() { }

    sayWeWon() { }

    sayWeLost() { }

    sayWeTied() { }

    sayEndSoloGame(finalScore: number) { }

    sayEndCoopGame(finalScore: number) { }

    protected arrayToString(array: Array<string>): string {
        let str = '';
        if (array.length == 1) {
            str = array.toString();
        }
        else {
            for (let i = 0; i < array.length; i++) {
                if (i == array.length - 1) {
                    str = str.slice(0, str.length - 2);
                    str += " et " + array[i]
                }
                else {
                    str += array[i] + ", "
                }
            }
        }
        return str;
    }

    protected getOpposingTeamNumber(teamNumber: number): number {
        if (teamNumber == 0)
            return 1;
        else
            return 0;
    }

    protected getDate(timestamp: number): string {
        const date = new Date(timestamp);
        return date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
    }
}