import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Brush } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/ressources/global-variables/global-variables';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class BrushService extends Tool {
    name: string = TOOL_NAMES.BRUSH_TOOL_NAME;
    private brushData: Brush;
    private pathData: Vec2[];
    width: number = 1;
    pattern: string;

    constructor(drawingService: DrawingService, public colorSelectionService: ColorSelectionService) {
        super(drawingService);
        this.clearPath();
    }

    reset(): void {
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';
    }

    onMouseDown(event: MouseEvent): void {
        if (event.button !== MouseButton.LEFT) {
            return;
        } else {
            this.mouseDown = true;
            this.clearPath();
            this.applyPattern(this.pattern);
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.updateBrushData();
            this.drawLine(this.drawingService.previewCtx, this.brushData);
            this.drawingService.setIsToolInUse(true);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.updateBrushData();
            this.drawLine(this.drawingService.baseCtx, this.brushData);
            this.drawingService.updateStack(this.brushData);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.applyPattern('none');
            this.drawingService.setIsToolInUse(false);
        }
        this.mouseDown = false;
        this.clearPath();
        this.drawingService.autoSave();
    }

    onMouseLeave(): void {
        this.updateBrushData();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawLine(this.drawingService.baseCtx, this.brushData);
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);

            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.updateBrushData();
            this.drawLine(this.drawingService.previewCtx, this.brushData);
        }
    }

    changeWidth(newWidth: number): void {
        this.width = newWidth;
    }

    setPattern(pattern: string): void {
        this.pattern = pattern;
    }

    drawLine(ctx: CanvasRenderingContext2D, brush: Brush): void {
        this.applyPattern(brush.pattern);
        ctx.lineWidth = brush.lineWidth;
        ctx.lineCap = ctx.lineJoin = 'round';
        ctx.strokeStyle = brush.primaryColor;
        ctx.beginPath();
        for (const point of brush.path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    applyPattern(pattern: string): void {
        if (pattern === 'none') {
            this.drawingService.baseCtx.filter = 'none';
            this.drawingService.previewCtx.filter = 'none';
        } else {
            this.drawingService.baseCtx.filter = 'url(/assets/patterns.svg#' + pattern + ')';
            this.drawingService.previewCtx.filter = 'url(/assets/patterns.svg#' + pattern + ')';
        }
        this.drawingService.baseCtx.strokeRect(-this.drawingService.baseCtx.lineWidth, 0, 1, 0);
        this.drawingService.previewCtx.strokeRect(-this.drawingService.previewCtx.lineWidth, 0, 1, 0);
    }

    private updateBrushData(): void {
        this.brushData = {
            type: 'brush',
            path: this.pathData,
            lineWidth: this.width,
            lineCap: 'round',
            pattern: this.pattern,
            primaryColor: this.colorSelectionService.primaryColor,
        };
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
