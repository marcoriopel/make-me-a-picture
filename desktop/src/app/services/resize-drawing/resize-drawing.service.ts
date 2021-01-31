import { Injectable } from '@angular/core';
import { Resize } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { CANVAS_RESIZING_POINTS } from '@app/ressources/global-variables/canvas-resizing-points';
import {
    HALF_RATIO,
    MINIMUM_CANVAS_HEIGHT,
    MINIMUM_CANVAS_WIDTH,
    MINIMUM_WORKSPACE_HEIGHT,
    MINIMUM_WORKSPACE_WIDTH,
    MouseButton,
} from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class ResizeDrawingService {
    canvasSize: Vec2;
    previewSize: Vec2;
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;
    serviceCaller: string;
    workSpaceSize: Vec2;
    resizeData: Resize;
    mouseEvent: MouseEvent;
    imageData: ImageData;

    constructor(public drawingService: DrawingService) {}

    setDefaultCanvasSize(): void {
        if (this.workSpaceSize.x > MINIMUM_WORKSPACE_WIDTH) {
            this.canvasSize.x = this.workSpaceSize.x * HALF_RATIO;
        } else {
            this.canvasSize.x = MINIMUM_CANVAS_WIDTH;
        }

        if (this.workSpaceSize.y > MINIMUM_WORKSPACE_HEIGHT) {
            this.canvasSize.y = this.workSpaceSize.y * HALF_RATIO;
        } else {
            this.canvasSize.y = MINIMUM_CANVAS_HEIGHT;
        }

        this.previewSize.x = this.canvasSize.x;
        this.previewSize.y = this.canvasSize.y;

        setTimeout(() => {
            this.drawingService.initializeBaseCanvas();
        });
    }

    resizeCanvasSize(width: number, height: number): void {
        this.drawingService.canvas.width = width;
        this.drawingService.canvas.height = height;
        this.previewSize.x = width;
        this.previewSize.y = height;
    }

    restoreCanvas(resizeData: Resize): void {
        this.drawingService.canvas.width = resizeData.canvasSize.x;
        this.drawingService.canvas.height = resizeData.canvasSize.y;
        this.previewSize.x = resizeData.canvasSize.x;
        this.previewSize.y = resizeData.canvasSize.y;
        this.drawingService.baseCtx.putImageData(resizeData.imageData, 0, 0);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.LEFT;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            const target = event.target as HTMLElement;
            this.serviceCaller = target.id;
        }
    }

    onMouseUp(): void {
        if (this.mouseDown) {
            this.imageData = this.drawingService.getCanvasData();
            const previewData: ImageData = this.drawingService.getPreviewData();

            this.canvasSize.x = this.previewSize.x;
            this.canvasSize.y = this.previewSize.y;

            this.updateResizeData();
            this.drawingService.updateStack(this.resizeData);

            setTimeout(() => {
                this.drawingService.initializeBaseCanvas();
                this.drawingService.baseCtx.putImageData(this.imageData, 0, 0);
                this.drawingService.previewCtx.putImageData(previewData, 0, 0);
            });
        }
        this.mouseDown = false;
        this.drawingService.autoSave();
    }

    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.clientX, y: event.clientY };
    }

    resizeCanvas(event: MouseEvent): void {
        switch (this.serviceCaller) {
            case CANVAS_RESIZING_POINTS.VERTICAL:
                this.verticalResize(event);
                break;
            case CANVAS_RESIZING_POINTS.HORIZONTAL:
                this.horizontalResize(event);
                break;
            case CANVAS_RESIZING_POINTS.VERTICAL_AND_HORIZONTAL:
                this.verticalAndHorizontalResize(event);
                break;
            default:
        }
    }

    private verticalResize(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            const mousePositionChangeY = mousePosition.y - this.mouseDownCoord.y;
            const newCanvasHeight = this.previewSize.y + mousePositionChangeY;
            if (newCanvasHeight >= MINIMUM_CANVAS_HEIGHT) {
                this.previewSize.y = newCanvasHeight;
            }
            this.mouseDownCoord = mousePosition;
        }
    }

    private verticalAndHorizontalResize(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            const mousePositionChangeY = mousePosition.y - this.mouseDownCoord.y;
            const newCanvasHeight = this.previewSize.y + mousePositionChangeY;
            if (newCanvasHeight >= MINIMUM_CANVAS_HEIGHT) {
                this.previewSize.y = newCanvasHeight;
            }
            const mousePositionChangeX = mousePosition.x - this.mouseDownCoord.x;
            const newCanvasWidth = this.previewSize.x + mousePositionChangeX;
            if (newCanvasWidth >= MINIMUM_CANVAS_WIDTH) {
                this.previewSize.x = newCanvasWidth;
            }
            this.mouseDownCoord = mousePosition;
        }
    }

    private horizontalResize(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            const mousePositionChangeX = mousePosition.x - this.mouseDownCoord.x;
            const newCanvasWidth = this.previewSize.x + mousePositionChangeX;
            if (newCanvasWidth >= MINIMUM_CANVAS_WIDTH) {
                this.previewSize.x = newCanvasWidth;
            }
            this.mouseDownCoord = mousePosition;
        }
    }

    private updateResizeData(): void {
        this.resizeData = {
            type: 'resize',
            canvasSize: { x: this.canvasSize.x, y: this.canvasSize.y },
            imageData: this.imageData,
        };
    }
}
