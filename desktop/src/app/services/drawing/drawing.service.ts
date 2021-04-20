import { Injectable } from '@angular/core';
import { Stroke } from '@app/classes/drawing';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    baseCtx: CanvasRenderingContext2D;
    gridCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    gridSpacing: number;
    opacity: number;
    isGridEnabled: boolean;
    canvas: HTMLCanvasElement;
    gridCanvas: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;
    strokeStack: Stroke[] = [];
    redoStack: Stroke[] = [];
    isToolInUse: Subject<boolean> = new Subject<boolean>();
    color: string;
    lineWidth: number;
    pencilWidth: number = 10;
    eraserWidth: number = 10;
    currentTool: string = 'pencil';
    strokes: Stroke[] = [];
    strokeNumber: number = 0;
    
    setGrid(): void {
        this.clearCanvas(this.gridCtx);
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        this.gridCtx.beginPath();
        for (let x = 0; x <= canvasWidth; x += this.gridSpacing) {
            this.gridCtx.moveTo(x, 0);
            this.gridCtx.lineTo(x, canvasHeight);
        }

        for (let x = 0; x <= canvasHeight; x += this.gridSpacing) {
            this.gridCtx.moveTo(0, x);
            this.gridCtx.lineTo(canvasWidth, x);
        }
        this.gridCtx.globalAlpha = 1;
        this.gridCtx.strokeStyle = 'black';
        this.gridCtx.closePath();
        this.gridCtx.stroke();
    }

    setIsToolInUse(isInUse: boolean): void {
        this.isToolInUse.next(isInUse);
    }

    getIsToolInUse(): Observable<boolean> {
        return this.isToolInUse.asObservable();
    }

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateStack(modification: Stroke): void {
        this.strokeStack.push(modification);
        if (this.redoStack.length) {
            this.redoStack = [];
        }
    }

    resetStack(): void {
        this.strokeStack = [];
        this.redoStack = [];
    }
}
