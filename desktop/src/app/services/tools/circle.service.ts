import { Injectable } from '@angular/core';
import { Trigonometry } from '@app/classes/math/trigonometry';
import { SelectionBox } from '@app/classes/selection-box';
import { Tool } from '@app/classes/tool';
import { Ellipse } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { FILL_STYLES } from '@app/ressources/global-variables/fill-styles';
import { DASH_LENGTH, DASH_SPACE_LENGTH, MouseButton, Quadrant } from '@app/ressources/global-variables/global-variables';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class CircleService extends Tool {
    name: string = TOOL_NAMES.CIRCLE_TOOL_NAME;
    fillStyle: number = FILL_STYLES.FILL;
    isShiftKeyDown: boolean = false;
    mouseDown: boolean = false;
    ellipseRadius: Vec2;
    ellipseCenter: Vec2;
    ellipseHeight: number;
    ellipseWidth: number;
    ellipseData: Ellipse;
    width: number = 1;
    firstPoint: Vec2;
    lastPoint: Vec2;
    circleHeight: number;
    circleWidth: number;
    quadrant: number;
    trigonometry: Trigonometry = new Trigonometry();

    constructor(drawingService: DrawingService, public colorSelectionService: ColorSelectionService) {
        super(drawingService);
    }

    initialize(): void {
        this.mouseDown = false;
    }

    setCursor(): void {
        this.drawingService.gridCanvas.style.cursor = 'crosshair';
    }

    changeWidth(newWidth: number): void {
        this.width = newWidth;
    }

    changeFillStyle(newFillStyle: number): void {
        this.fillStyle = newFillStyle;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.isShiftKeyDown = true;
            if (this.mouseDown) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawShape(this.drawingService.previewCtx);
            }
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Shift' && this.isShiftKeyDown) {
            this.isShiftKeyDown = false;
            if (this.mouseDown) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawShape(this.drawingService.previewCtx);
            }
        }
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
            this.drawShape(this.drawingService.baseCtx);
            this.mouseDown = false;
            this.drawingService.setIsToolInUse(false);
        }
        this.drawingService.autoSave();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.lastPoint = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawShape(this.drawingService.previewCtx);
        }
    }

    drawShape(ctx: CanvasRenderingContext2D): SelectionBox {
        const topLeftPoint = this.trigonometry.findTopLeftPointCircle(this.firstPoint, this.lastPoint);
        ctx.fillStyle = this.colorSelectionService.primaryColor;
        ctx.strokeStyle = this.colorSelectionService.secondaryColor;
        ctx.lineWidth = this.width;
        ctx.setLineDash([0]);

        if (this.fillStyle === FILL_STYLES.FILL) {
            ctx.strokeStyle = this.colorSelectionService.primaryColor;
            ctx.lineWidth = 1;
        }

        this.setEllipseHeight();
        this.setEllipseWidth();
        this.ellipseRadius = { x: this.ellipseWidth / 2, y: this.ellipseHeight / 2 };
        this.ellipseCenter = { x: topLeftPoint.x + this.ellipseRadius.x, y: topLeftPoint.y + this.ellipseRadius.y };

        if (this.isShiftKeyDown) {
            this.drawCircle(ctx, topLeftPoint);
        } else {
            this.updateEllipseData();
            this.drawEllipse(ctx, this.ellipseData);
        }

        if (ctx === this.drawingService.previewCtx) {
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.setLineDash([DASH_LENGTH, DASH_SPACE_LENGTH]);
            ctx.rect(topLeftPoint.x, topLeftPoint.y, this.ellipseWidth, this.ellipseHeight);
            ctx.stroke();
            ctx.lineWidth = this.width;
        } else {
            this.drawingService.updateStack(this.ellipseData);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawingService.previewCtx.setLineDash([0]);
        }

        topLeftPoint.x = this.ellipseData.center.x - this.ellipseRadius.x;
        topLeftPoint.y = this.ellipseData.center.y - this.ellipseRadius.y;
        return { startingPoint: topLeftPoint, width: this.ellipseRadius.x * 2, height: this.ellipseRadius.y * 2 };
    }

    drawEllipse(ctx: CanvasRenderingContext2D, ellipse: Ellipse): void {
        ctx.fillStyle = ellipse.primaryColor;
        ctx.strokeStyle = ellipse.secondaryColor;
        ctx.lineWidth = ellipse.lineWidth;

        if (ellipse.fillStyle === FILL_STYLES.FILL) {
            ctx.strokeStyle = ellipse.primaryColor;
            ctx.lineWidth = 1;
        }

        ctx.beginPath();
        if (ellipse.radius.x > ctx.lineWidth / 2 && ellipse.radius.y > ctx.lineWidth / 2) {
            ellipse.radius.x -= ctx.lineWidth / 2;
            ellipse.radius.y -= ctx.lineWidth / 2;
            ctx.ellipse(ellipse.center.x, ellipse.center.y, ellipse.radius.x, ellipse.radius.y, 0, 0, Math.PI * 2, false);
            if (ellipse.fillStyle !== FILL_STYLES.BORDER && ellipse.fillStyle !== FILL_STYLES.DASHED) {
                ctx.fill();
            }
        }

        ctx.stroke();
    }

    drawCircle(ctx: CanvasRenderingContext2D, point: Vec2): void {
        this.setCircleHeight();
        this.setCircleWidth();
        this.quadrant = this.trigonometry.findQuadrant(this.firstPoint, this.lastPoint);
        const ellipseRadiusX = this.circleWidth / 2;
        const ellipseRadiusY = this.circleHeight / 2;
        let circleRadius = Math.min(ellipseRadiusX, ellipseRadiusY);
        let ellipseCenterX = point.x + circleRadius;
        let ellipseCenterY = point.y + circleRadius;
        switch (this.quadrant) {
            case Quadrant.BOTTOM_LEFT:
                ellipseCenterX = this.firstPoint.x - circleRadius;
                ellipseCenterY = this.firstPoint.y + circleRadius;
                break;
            case Quadrant.TOP_LEFT:
                ellipseCenterX = this.firstPoint.x - circleRadius;
                ellipseCenterY = this.firstPoint.y - circleRadius;
                break;
            case Quadrant.BOTTOM_RIGHT:
                ellipseCenterX = this.firstPoint.x + circleRadius;
                ellipseCenterY = this.firstPoint.y + circleRadius;
                break;
            case Quadrant.TOP_RIGHT:
                ellipseCenterX = this.firstPoint.x + circleRadius;
                ellipseCenterY = this.firstPoint.y - circleRadius;
                break;
        }
        ctx.beginPath();
        if (circleRadius > ctx.lineWidth / 2) {
            circleRadius -= ctx.lineWidth / 2;
            ctx.arc(ellipseCenterX, ellipseCenterY, circleRadius, 0, Math.PI * 2, false);
            if (this.fillStyle !== FILL_STYLES.BORDER && this.fillStyle !== FILL_STYLES.DASHED) {
                ctx.fill();
            }
        }

        ctx.stroke();

        this.ellipseRadius = { x: circleRadius, y: circleRadius };
        this.ellipseCenter = { x: ellipseCenterX, y: ellipseCenterY };
        this.updateEllipseData();
    }

    setEllipseWidth(): void {
        this.ellipseWidth = Math.abs(this.firstPoint.x - this.lastPoint.x);
    }

    setEllipseHeight(): void {
        this.ellipseHeight = Math.abs(this.firstPoint.y - this.lastPoint.y);
    }

    private updateEllipseData(): void {
        this.ellipseData = {
            type: 'ellipse',
            primaryColor: this.colorSelectionService.primaryColor,
            secondaryColor: this.colorSelectionService.secondaryColor,
            center: this.ellipseCenter,
            radius: this.ellipseRadius,
            fillStyle: this.fillStyle,
            isShiftDown: this.isShiftKeyDown,
            lineWidth: this.width,
            firstPoint: this.firstPoint,
            lastPoint: this.lastPoint,
        };
    }

    setCircleWidth(): void {
        this.circleWidth = Math.abs(this.firstPoint.x - this.lastPoint.x);
    }

    setCircleHeight(): void {
        this.circleHeight = Math.abs(this.firstPoint.y - this.lastPoint.y);
    }
}
