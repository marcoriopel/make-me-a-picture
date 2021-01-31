import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Pencil } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/ressources/global-variables/global-variables';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends Tool {
    private pathData: Vec2[];
    private pencilData: Pencil;
    name: string = TOOL_NAMES.PENCIL_TOOL_NAME;
    width: number = 1;

    constructor(drawingService: DrawingService, public colorSelectionService: ColorSelectionService) {
        super(drawingService);
        this.clearPath();
    }

    onMouseLeave(): void {
        this.updatePencilData();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPencilStroke(this.drawingService.baseCtx, this.pencilData);
        this.clearPath();
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
            this.updatePencilData();
            this.drawPencilStroke(this.drawingService.previewCtx, this.pencilData);
            this.drawingService.setIsToolInUse(true);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.updatePencilData();
            this.drawPencilStroke(this.drawingService.baseCtx, this.pencilData);
            this.drawingService.updateStack(this.pencilData);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawingService.setIsToolInUse(false);
        }
        this.mouseDown = false;
        this.clearPath();
        this.drawingService.autoSave();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.updatePencilData();
            this.drawPencilStroke(this.drawingService.previewCtx, this.pencilData);
        }
    }

    drawPencilStroke(ctx: CanvasRenderingContext2D, pencil: Pencil): void {
        ctx.lineWidth = pencil.lineWidth;
        ctx.strokeStyle = pencil.primaryColor;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (const point of pencil.path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    changeWidth(newWidth: number): void {
        this.width = newWidth;
    }

    private updatePencilData(): void {
        this.pencilData = {
            type: 'pencil',
            path: this.pathData,
            lineWidth: this.width,
            primaryColor: this.colorSelectionService.primaryColor,
        };
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
