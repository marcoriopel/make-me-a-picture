import { Injectable } from '@angular/core';
import { Brush, Ellipse, Eraser, Fill, Line, Pencil, Polygone, Rectangle, Resize, Selection, Stamp } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { MAX_PERCENTAGE } from '@app/ressources/global-variables/global-variables';
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
    undoStack: (Pencil | Brush | Eraser | Polygone | Line | Resize | Fill | Rectangle | Ellipse | Selection | Stamp)[] = [];
    redoStack: (Pencil | Brush | Eraser | Polygone | Line | Resize | Fill | Rectangle | Ellipse | Selection | Stamp)[] = [];
    isToolInUse: Subject<boolean> = new Subject<boolean>();

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
        this.gridCtx.globalAlpha = this.opacity / MAX_PERCENTAGE;
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

    initializeBaseCanvas(): void {
        if (this.isGridEnabled) this.setGrid();
        this.baseCtx.fillStyle = 'white';
        this.baseCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    isCanvasBlank(context: CanvasRenderingContext2D): boolean {
        const blank = document.createElement('canvas');
        blank.width = this.canvas.width;
        blank.height = this.canvas.height;
        const blankCtx = blank.getContext('2d') as CanvasRenderingContext2D;
        blankCtx.fillStyle = 'white';
        blankCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        return context.canvas.toDataURL() === blank.toDataURL();
    }

    applyPreview(): void {
        this.baseCtx.drawImage(this.previewCanvas, 0, 0);
        this.clearCanvas(this.previewCtx);
    }

    updateStack(modification: Pencil | Brush | Eraser | Polygone | Line | Resize | Fill | Rectangle | Ellipse | Selection | Stamp): void {
        this.undoStack.push(modification);
        if (this.redoStack.length) {
            this.redoStack = [];
        }
    }

    drawFill(fill: Fill): void {
        this.baseCtx.putImageData(fill.imageData, 0, 0);
    }

    restoreSelection(selection: Selection): void {
        this.baseCtx.putImageData(selection.imageData, 0, 0);
    }

    getPixelData(pixelCoord: Vec2): Uint8ClampedArray {
        const pixelData = this.baseCtx.getImageData(pixelCoord.x, pixelCoord.y, 1, 1).data;
        return pixelData;
    }

    getCanvasData(): ImageData {
        const canvasData = this.baseCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        return canvasData;
    }

    getPreviewData(): ImageData {
        const canvasData = this.previewCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        return canvasData;
    }

    resetStack(): void {
        this.undoStack = [];
        this.redoStack = [];
    }

    autoSave(): void {
        if (!this.canvas) return;
        const sourceDrawing = this.canvas.toDataURL();
        localStorage.clear();
        localStorage.setItem('drawingKey', sourceDrawing);
    }
}
