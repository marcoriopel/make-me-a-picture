import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Eraser } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { MIN_ERASER_TOOL_WIDTH, MouseButton } from '@app/ressources/global-variables/global-variables';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class EraserService extends Tool {
    name: string = TOOL_NAMES.ERASER_TOOL_NAME;
    private eraserData: Eraser;
    private pathData: Vec2[];
    width: number = 5;
    minToolWidth: number = MIN_ERASER_TOOL_WIDTH;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.clearPath();
    }

    setCursor(): void {
        this.drawingService.gridCanvas.style.cursor = 'none';
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';
        if (event.button !== MouseButton.LEFT) {
            return;
        } else {
            this.mouseDown = true;
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.updateEraserData();
            this.drawRect(this.drawingService.previewCtx, this.pathData);
            this.drawingService.setIsToolInUse(true);
        }
        this.squareCursor(event);
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.updateEraserData();
            this.drawEraserStroke(this.drawingService.baseCtx, this.eraserData);
            this.drawingService.updateStack(this.eraserData);
            this.drawingService.setIsToolInUse(false);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseLeave(): void {
        this.updateEraserData();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawEraserStroke(this.drawingService.baseCtx, this.eraserData);
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.updateEraserData();
            this.drawEraserStroke(this.drawingService.previewCtx, this.eraserData);
        }
        this.squareCursor(event);
    }

    private squareCursor(event: MouseEvent): void {
        this.drawingService.previewCtx.lineWidth = 1;
        this.drawingService.previewCtx.strokeStyle = 'black';
        this.drawingService.previewCtx.fillStyle = 'white';
        this.drawingService.previewCtx.strokeRect(
            this.getPositionFromMouse(event).x - this.width / 2,
            this.getPositionFromMouse(event).y - this.width / 2,
            this.width,
            this.width,
        );
        this.drawingService.previewCtx.fillRect(
            this.getPositionFromMouse(event).x - this.width / 2,
            this.getPositionFromMouse(event).y - this.width / 2,
            this.width,
            this.width,
        );
    }

    drawEraserStroke(ctx: CanvasRenderingContext2D, eraser: Eraser): void {
        ctx.lineWidth = eraser.lineWidth;
        ctx.strokeStyle = 'white';
        ctx.lineCap = 'square';
        ctx.beginPath();
        for (const point of eraser.path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    changeWidth(newWidth: number): void {
        this.width = newWidth;
    }

    private drawRect(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
        ctx.beginPath();
        for (const point of path) {
            ctx.rect(point.x - this.width / 2, point.y - this.width / 2, this.width, this.width);
        }
        ctx.fill();
        ctx.stroke();
    }

    private updateEraserData(): void {
        this.eraserData = {
            type: 'eraser',
            path: this.pathData,
            lineWidth: this.width,
            lineCap: 'square',
            fillStyle: 'white',
            primaryColor: 'white',
        };
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
