import { Drawing, Vec2 } from '@app/ressources/interfaces/drawings.interface';
import { DrawingEvent, MouseDown } from '@app/ressources/interfaces/game-events';
import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { drawingEventType } from '@app/ressources/variables/game-variables';
import { Personnality, NB_PERSONNALITIES } from '@app/ressources/variables/virtual-player-variables'
import { DrawingsService } from '@app/services/drawings.service';
import { SocketService } from '@app/services/sockets/socket.service';
import { injectable } from 'inversify';
import { isBreakOrContinueStatement } from 'typescript';

@injectable()
export class VirtualPlayer {
    private personnality: number;
    private username: string;
    private avatar: number;
    private drawingsService: DrawingsService;
    private socketService: SocketService;
    private currentDrawing: Drawing;
    private gameId: string;
    
    constructor(gameId: string) { 
        this.gameId = gameId;
        this.personnality = Math.floor(Math.random() * NB_PERSONNALITIES);
        this.setBasicUserInfo();
    }

    private setBasicUserInfo(){
        switch(this.personnality){
            case Personnality.NICE:
                this.username = "Bernard";
                this.avatar = 6;
                break;
            case Personnality.ANXIOUS:
                this.username = "Ginette";
                this.avatar = 7;
                break;
            case Personnality.PASSIVE_AGRESSIVE:
                this.username = "Kevin";
                this.avatar = 8;
                break;
            case Personnality.COMPETETIVE:
                this.username = "Émilio";
                this.avatar = 9;
                break;
        }
    }

    setServices(drawingsService: DrawingsService, socketService: SocketService): void{
        this.drawingsService = drawingsService;
        this.socketService = socketService;
    }

    async getNewDrawing(difficulty: number): Promise<string>{
        try {
            this.currentDrawing = await this.drawingsService.getRandomDrawing(difficulty);
            // console.log(this.currentDrawing);
            return this.currentDrawing.drawingName;
        }
        catch(err){
            console.error(err)
        }
    }

    async startDrawing() {
        for(let stroke of this.currentDrawing.strokes){
            const mouseDown: MouseDown = {
                coords: stroke.path[0],
                lineColor: stroke.lineColor,
                lineWidth: stroke.lineWidth,
            }
            const drawingEvent: DrawingEvent = {
                eventType: drawingEventType.MOUSEDOWN,
                event: mouseDown,
                gameId: this.gameId,
            }
            this.socketService.getSocket().to(this.gameId).emit('drawingEvent', { "drawingEvent": drawingEvent });
            await this.drawStroke(stroke.path);
        }
    }

    async drawStroke(path: Vec2[]) {
        for(let point of path){
            let isLastPoint: boolean = point == path[path.length - 1] ? true : false;
            await this.drawPoint(point, isLastPoint);
        }
    }

    async drawPoint(point: Vec2, isLastPoint: boolean){
        let eventType: number = isLastPoint ? drawingEventType.MOUSEUP : drawingEventType.MOUSEMOVE;
        const drawingEvent: DrawingEvent = {
            eventType: eventType,
            event: point,
            gameId: this.gameId,
        }
        this.socketService.getSocket().to(this.gameId).emit('drawingEvent', { "drawingEvent": drawingEvent });
        await this.delay();
    }

    delay = () => new Promise(res => setTimeout(res, 50))
        

    getBasicUser(): BasicUser{
        return {"username": this.username, "avatar": this.avatar}
    }
}