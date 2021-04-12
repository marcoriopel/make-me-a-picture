import { Injectable } from '@angular/core';
import { Stroke } from '@app/classes/drawing';
import { DrawingEvent, drawingEventType, MouseDown } from '@app/classes/game';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/ressources/global-variables/global-variables';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GameService } from '../game/game.service';
import { SocketService } from '../socket/socket.service';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends Tool {
    private pathData: Vec2[];
    private pencilData: Stroke;
    strokes: Stroke[] = [];
    isCurrentToolEraser: boolean = false;
    strokeNumber: number = 0;
    name: string = TOOL_NAMES.PENCIL_TOOL_NAME;
    width: number = 1;

    constructor(drawingService: DrawingService, public colorSelectionService: ColorSelectionService, public gameService: GameService, private socketService: SocketService) {
        super(drawingService);
        this.clearPath();
    }

    onMouseLeave(): void {
        this.updatePencilData();
        this.drawPencilStroke(this.drawingService.baseCtx, this.pencilData);
        this.clearPath();
        let mouseEvent = {
            button: MouseButton.LEFT,
        } as MouseEvent
        this.onMouseUp(mouseEvent);
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.baseCtx.filter = 'none';
        if (event.button !== MouseButton.LEFT) {
            return;
        } else {
            this.mouseDown = true;
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.updatePencilData();
            if(!this.gameService.isInGame || this.gameService.isPlayerDrawing){
                this.strokeNumber++;
            }

            let stroke: Stroke = {
                lineColor: this.pencilData.lineColor,
                lineWidth: this.pencilData.lineWidth,
                strokeNumber: this.pencilData.strokeNumber,
                path: [],
                isEraser: this.pencilData.isEraser,
            }
            this.drawingService.strokes.push(stroke);
            this.drawingService.strokes.sort((stroke1, stroke2) => stroke1.strokeNumber - stroke2.strokeNumber )
            
            this.drawPencilStroke(this.drawingService.baseCtx, this.pencilData);
            this.drawingService.setIsToolInUse(true);
        }
        if(this.gameService.drawingPlayer == localStorage.getItem('username') && this.gameService.isInGame){
            const mouseDown: MouseDown = {
                coords: this.mouseDownCoord,
                lineColor: this.drawingService.color,
                lineWidth: this.drawingService.lineWidth,
                strokeNumber: this.strokeNumber,
            }
            const drawingEvent: DrawingEvent = {
                eventType: drawingEventType.MOUSEDOWN,
                event: mouseDown,
                gameId: this.gameService.gameId,
            }
            this.socketService.emit('drawingEvent', drawingEvent);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.updatePencilData();
            this.drawPencilStroke(this.drawingService.baseCtx, this.pencilData);
            this.drawingService.updateStack(this.pencilData);
            this.drawingService.setIsToolInUse(false);
            if(this.gameService.drawingPlayer == localStorage.getItem('username') && this.gameService.isInGame){
                const drawingEvent: DrawingEvent = {
                    eventType: drawingEventType.MOUSEUP,
                    event: mousePosition,
                    gameId: this.gameService.gameId,
                }
                this.socketService.emit('drawingEvent', drawingEvent);
            }
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            if(this.gameService.isInGame) {
                this.drawingService.strokes[this.strokeNumber - 1].path.push(mousePosition);
            }
            this.drawingService.clearCanvas(this.drawingService.baseCtx);
            this.drawingService.strokeStack.forEach((stroke: any) => {
                this.drawPencilStroke(this.drawingService.baseCtx, stroke);
            });
            this.updatePencilData();
            this.drawPencilStroke(this.drawingService.baseCtx, this.pencilData);
            if(this.gameService.drawingPlayer == localStorage.getItem('username') && this.gameService.isInGame){
                const drawingEvent: DrawingEvent = {
                    eventType: drawingEventType.MOUSEMOVE,
                    event: mousePosition,
                    gameId: this.gameService.gameId,
                }
                this.socketService.emit('drawingEvent', drawingEvent);
            }
        }
    }

    drawPencilStroke(ctx: CanvasRenderingContext2D, pencil: Stroke): void {

        if(!this.gameService.isInGame || this.gameService.isPlayerDrawing){
            ctx.lineWidth = pencil.lineWidth;
            ctx.strokeStyle = pencil.lineColor;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.beginPath();
    
            for(let i = 0; i < pencil.path.length - 1; i++){
                ctx.lineTo(pencil.path[i].x, pencil.path[i].y);
            }
            ctx.stroke();
        } else {
            for(let i = 0; i < this.drawingService.strokes.length; i++){
                ctx.lineWidth = this.drawingService.strokes[i].lineWidth;
                ctx.strokeStyle = this.drawingService.strokes[i].lineColor;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.beginPath();
                for(let j = 0; j < this.drawingService.strokes[i].path.length; j++){
                    ctx.lineTo(this.drawingService.strokes[i].path[j].x, this.drawingService.strokes[i].path[j].y);
                }
                ctx.stroke();
            }
        }
    }

    changeWidth(newWidth: number): void {
        this.width = newWidth;
    }

    formatDrawing(): any{

        let eraserStrokes: Stroke[] = this.drawingService.strokeStack.filter(stroke => stroke.isEraser);
        let pencilStrokes: Stroke[] = this.drawingService.strokeStack.filter(stroke => !stroke.isEraser);
        
        return { eraserStrokes: eraserStrokes, pencilStrokes: pencilStrokes } 
    }

    private updatePencilData(): void {
        this.pencilData = {
            path: this.pathData,
            isEraser: this.isCurrentToolEraser,
            strokeNumber: this.strokeNumber,
            lineWidth: this.drawingService.lineWidth,
            lineColor: this.drawingService.color,
        };
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
