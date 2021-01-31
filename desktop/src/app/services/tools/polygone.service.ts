import { Injectable } from '@angular/core';
import { Trigonometry } from '@app/classes/math/trigonometry';
import { Tool } from '@app/classes/tool';
import { Polygone } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { FILL_STYLES } from '@app/ressources/global-variables/fill-styles';
import {
    DASH_LENGTH,
    DASH_SPACE_LENGTH,
    LINE_WIDTH_POLYGONE_CORRECTION,
    MAX_SIDES,
    MIN_SIDES,
    MouseButton,
    Quadrant,
} from '@app/ressources/global-variables/global-variables';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { CircleService } from '@app/services/tools/circle.service';

@Injectable({
    providedIn: 'root',
})
export class PolygoneService extends Tool {
    name: string = TOOL_NAMES.POLYGONE_TOOL_NAME;
    lastPoint: Vec2;
    firstPoint: Vec2;
    fillStyle: number = FILL_STYLES.FILL_AND_BORDER;
    width: number = 1;
    sides: number = 3;
    circleHeight: number;
    circleWidth: number;
    centerX: number;
    centerY: number;
    center: Vec2;
    trigonometry: Trigonometry = new Trigonometry();
    polygoneData: Polygone;
    minNumberOfSides: number = MIN_SIDES;
    maxNumberOfSides: number = MAX_SIDES;

    constructor(drawingService: DrawingService, public colorSelectionService: ColorSelectionService, public circleService: CircleService) {
        super(drawingService);
    }

    initialize(): void {
        this.drawingService.previewCtx.lineJoin = 'miter';
        this.drawingService.baseCtx.lineJoin = 'miter';
    }

    setCursor(): void {
        this.drawingService.gridCanvas.style.cursor = 'crosshair';
    }

    changeFillStyle(newFillStyle: number): void {
        this.fillStyle = newFillStyle;
    }
    changeWidth(newWidth: number): void {
        this.width = newWidth;
    }
    changeSides(sides: number): void {
        this.sides = sides;
    }
    setCenterX(): void {
        this.centerX = Math.abs(this.firstPoint.y - this.lastPoint.y);
    }
    setCenterY(): void {
        this.centerY = Math.abs(this.firstPoint.y - this.lastPoint.y);
    }
    set setSides(sides: number) {
        this.sides = sides;
    }
    setCircleWidth(): void {
        this.circleWidth = Math.abs(this.firstPoint.x - this.lastPoint.x);
    }
    setCircleHeight(): void {
        this.circleHeight = Math.abs(this.firstPoint.y - this.lastPoint.y);
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';
        this.mouseDown = event.button === MouseButton.LEFT;
        if (this.mouseDown) {
            this.firstPoint = this.getPositionFromMouse(event);
            this.lastPoint = this.getPositionFromMouse(event);
            this.drawingService.setIsToolInUse(true);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.lastPoint = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.updatePolygoneData();
            if (this.firstPoint.x !== this.lastPoint.x && this.firstPoint.y !== this.lastPoint.y) {
                this.drawPolygone(this.drawingService.baseCtx, this.polygoneData);
                this.drawingService.updateStack(this.polygoneData);
            }
            this.mouseDown = false;
            this.drawingService.setIsToolInUse(false);

            this.circleWidth = 0;
            this.circleHeight = 0;
        }
        this.drawingService.autoSave();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.lastPoint = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.center = this.trigonometry.getCenter(this.firstPoint, this.lastPoint);
            const currentLineWidth = this.drawingService.previewCtx.lineWidth;
            this.drawingService.previewCtx.lineWidth = 1;
            this.drawingService.previewCtx.strokeStyle = 'black';
            this.drawingService.previewCtx.setLineDash([DASH_LENGTH, DASH_SPACE_LENGTH]);
            this.drawCircle(this.drawingService.previewCtx);
            this.drawingService.previewCtx.lineWidth = currentLineWidth;
            this.drawingService.previewCtx.setLineDash([0]);
            this.updatePolygoneData();
            this.drawPolygone(this.drawingService.previewCtx, this.polygoneData);
        }
    }

    drawCircle(ctx: CanvasRenderingContext2D): void {
        this.circleService.changeFillStyle(FILL_STYLES.BORDER);
        this.circleService.firstPoint = this.firstPoint;
        this.circleService.lastPoint = this.lastPoint;
        this.circleService.drawCircle(ctx, this.trigonometry.findTopLeftPointCircle(this.firstPoint, this.lastPoint));
    }

    drawPolygone(ctx: CanvasRenderingContext2D, polygoneData: Polygone): void {
        ctx.fillStyle = polygoneData.primaryColor;
        ctx.strokeStyle = polygoneData.secondaryColor;
        ctx.lineWidth = polygoneData.lineWidth;
        ctx.setLineDash([0]);

        if (this.fillStyle === FILL_STYLES.FILL) {
            ctx.strokeStyle = this.colorSelectionService.primaryColor;
            ctx.lineWidth = 1;
        }

        this.firstPoint = polygoneData.firstPoint;
        this.lastPoint = polygoneData.lastPoint;
        this.setCircleHeight();
        this.setCircleWidth();
        const ellipseRadiusX = polygoneData.circleWidth / 2;
        const ellipseRadiusY = polygoneData.circleHeight / 2;
        let circleRadius = Math.min(ellipseRadiusX, ellipseRadiusY);
        const quadrant = this.trigonometry.findQuadrant(polygoneData.firstPoint, polygoneData.lastPoint);
        const center: Vec2 = { x: 0, y: 0 };

        switch (quadrant) {
            case Quadrant.BOTTOM_LEFT:
                center.x = polygoneData.firstPoint.x - circleRadius;
                center.y = polygoneData.firstPoint.y + circleRadius;
                break;
            case Quadrant.TOP_LEFT:
                center.x = polygoneData.firstPoint.x - circleRadius;
                center.y = polygoneData.firstPoint.y - circleRadius;
                break;
            case Quadrant.BOTTOM_RIGHT:
                center.x = polygoneData.firstPoint.x + circleRadius;
                center.y = polygoneData.firstPoint.y + circleRadius;
                break;
            case Quadrant.TOP_RIGHT:
                center.x = polygoneData.firstPoint.x + circleRadius;
                center.y = polygoneData.firstPoint.y - circleRadius;
                break;
        }
        ctx.beginPath();
        ctx.lineWidth = polygoneData.lineWidth;

        if (circleRadius > ctx.lineWidth / LINE_WIDTH_POLYGONE_CORRECTION) {
            circleRadius -= ctx.lineWidth / LINE_WIDTH_POLYGONE_CORRECTION;
            ctx.moveTo(center.x, center.y - circleRadius);
            for (let i = 0; i <= this.sides + 1; i++) {
                ctx.lineTo(
                    center.x + circleRadius * Math.cos((i * 2 * Math.PI) / polygoneData.sides - Math.PI / 2),
                    center.y + circleRadius * Math.sin((i * 2 * Math.PI) / polygoneData.sides - Math.PI / 2),
                );
            }
            if (this.fillStyle !== FILL_STYLES.BORDER) {
                ctx.fill();
            }
        }

        ctx.stroke();
        ctx.closePath();
    }

    private updatePolygoneData(): void {
        this.polygoneData = {
            type: 'polygone',
            primaryColor: this.colorSelectionService.primaryColor,
            secondaryColor: this.colorSelectionService.secondaryColor,
            fillStyle: this.fillStyle,
            lineWidth: this.width,
            circleHeight: this.circleHeight,
            circleWidth: this.circleWidth,
            firstPoint: this.firstPoint,
            lastPoint: this.lastPoint,
            sides: this.sides,
        };
    }
}
