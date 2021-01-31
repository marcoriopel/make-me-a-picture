import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import {
    MAX_SPRAY_DOT_WIDTH,
    MAX_SPRAY_FREQUENCY,
    MIN_SPRAY_DOT_WIDTH,
    MIN_SPRAY_FREQUENCY,
    MIN_SPRAY_WIDTH,
    MouseButton,
    ONE_SECOND,
    SPRAY_DENSITY,
} from '@app/ressources/global-variables/global-variables';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

// this tool was inpired by the code found on http://perfectionkills.com/exploring-canvas-drawing-techniques/

@Injectable({
    providedIn: 'root',
})
export class SprayService extends Tool {
    name: string = TOOL_NAMES.SPRAY_TOOL_NAME;
    density: number = SPRAY_DENSITY;
    minDotWidth: number = MIN_SPRAY_DOT_WIDTH;
    maxDotWidth: number = MAX_SPRAY_DOT_WIDTH;
    minFrequency: number = MIN_SPRAY_FREQUENCY;
    maxFrequency: number = MAX_SPRAY_FREQUENCY;
    minToolWidth: number = MIN_SPRAY_WIDTH;

    timeoutId: ReturnType<typeof setTimeout>;
    mouseCoord: Vec2;
    width: number = this.minToolWidth;
    dotWidth: number = this.minDotWidth;
    sprayFrequency: number = this.minFrequency;

    constructor(drawingService: DrawingService, public colorSelectionService: ColorSelectionService) {
        super(drawingService);
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';
        if (event.button !== MouseButton.LEFT) {
            return;
        } else {
            this.mouseDown = true;
            this.mouseCoord = this.getPositionFromMouse(event);
            this.timeoutId = setTimeout(this.drawSpray, ONE_SECOND / this.sprayFrequency, this, this.drawingService.previewCtx);
            this.drawingService.setIsToolInUse(true);
        }
    }

    onMouseUp(): void {
        if (this.mouseDown) {
            clearTimeout(this.timeoutId);
            this.drawingService.applyPreview();
            this.drawingService.setIsToolInUse(false);
        }
        this.mouseDown = false;
        this.drawingService.autoSave();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseCoord = this.getPositionFromMouse(event);
        }
    }

    onMouseLeave(): void {
        if (this.mouseDown) {
            clearTimeout(this.timeoutId);
            this.drawingService.applyPreview();
            this.drawingService.setIsToolInUse(false);
        }
    }

    onMouseEnter(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseCoord = this.getPositionFromMouse(event);
            this.timeoutId = setTimeout(this.drawSpray, ONE_SECOND / this.sprayFrequency, this, this.drawingService.previewCtx);
            this.drawingService.setIsToolInUse(true);
        }
    }

    drawSpray(self: SprayService, ctx: CanvasRenderingContext2D): void {
        for (let i = self.density; i--; ) {
            const angle = self.getRandomNumber(0, Math.PI * 2);
            const radius = self.getRandomNumber(0, self.width);
            ctx.globalAlpha = Math.random();
            ctx.strokeStyle = self.colorSelectionService.primaryColor;
            ctx.fillStyle = self.colorSelectionService.primaryColor;
            ctx.beginPath();
            ctx.arc(
                self.mouseCoord.x + radius * Math.cos(angle),
                self.mouseCoord.y + radius * Math.sin(angle),
                self.getRandomNumber(1, self.dotWidth / 2),
                0,
                2 * Math.PI,
            );
            ctx.fill();
        }
        if (!self.timeoutId) return;
        self.timeoutId = setTimeout(self.drawSpray, ONE_SECOND / self.sprayFrequency, self, ctx);
    }

    getRandomNumber(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    changeWidth(newWidth: number): void {
        this.width = newWidth;
    }

    changeDotWidth(newDotWidth: number): void {
        this.dotWidth = newDotWidth;
    }

    changeSprayFrequency(newSprayFrequency: number): void {
        this.sprayFrequency = newSprayFrequency;
    }

    reset(): void {
        this.drawingService.previewCtx.globalAlpha = 1;
    }
}
