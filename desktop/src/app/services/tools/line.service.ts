import { Injectable } from '@angular/core';
import { StraightLine } from '@app/classes/line';
import { Trigonometry } from '@app/classes/math/trigonometry';
import { Tool } from '@app/classes/tool';
import { Line } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { LineAngle, MouseButton, Quadrant } from '@app/ressources/global-variables/global-variables';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    trigonometry: Trigonometry = new Trigonometry();
    name: string = TOOL_NAMES.LINE_TOOL_NAME;
    hasLastPointBeenChanged: boolean = false;
    isShiftDoubleClick: boolean = false;
    shiftClick: Vec2 = { x: 0, y: 0 };
    isShiftKeyDown: boolean = false;
    storedLines: StraightLine[] = [];
    endingClickCoordinates: Vec2;
    isDrawing: boolean = false;
    numberOfClicks: number = 0;
    mouseClicks: Vec2[] = [];
    mouseEvent: MouseEvent;
    isDot: boolean = false;
    lineWidth: number = 1;
    dotWidth: number = 1;
    lineData: Line;
    line: StraightLine;

    constructor(public drawingService: DrawingService, public colorSelectionService: ColorSelectionService) {
        super(drawingService);
    }

    setCursor(): void {
        this.drawingService.gridCanvas.style.cursor = 'crosshair';
    }

    changeLineWidth(newWidth: number): void {
        this.lineWidth = newWidth;
    }

    changeJunction(isDot: boolean): void {
        this.isDot = isDot;
    }

    changeDotWidth(newWidth: number): void {
        this.dotWidth = newWidth;
    }

    onMouseUp(event: MouseEvent): void {
        this.drawingService.setIsToolInUse(true);
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';
        if (event.button !== MouseButton.LEFT) {
            return;
        }
        this.isDrawing = true;
        this.mouseClicks.push(this.getPositionFromMouse(event));
        this.numberOfClicks = this.mouseClicks.length;

        // Check if it's a new line
        if (this.numberOfClicks <= 1) {
            return;
        }

        // Check if it's a double click holding shift
        if (this.getPositionFromMouse(event).x === this.shiftClick.x && this.getPositionFromMouse(event).y === this.shiftClick.y) {
            this.isShiftDoubleClick = true;
        }
        this.shiftClick = this.getPositionFromMouse(event);

        // Check if it is a double click
        const isDoubleClick: boolean = this.checkIfDoubleClick();
        if (isDoubleClick || this.isShiftDoubleClick) {
            this.isDrawing = false;
            // Handle case when user double click when there is no line
            if (this.mouseClicks[0].x === this.mouseClicks[1].x && this.mouseClicks[0].y === this.mouseClicks[1].y) {
                this.mouseClicks = [];
                this.numberOfClicks = 0;
                return;
            }
            // Check if the last point is 20px away from initial point
            const distance = this.trigonometry.distanceBetweenTwoDots(this.mouseClicks[0], this.mouseClicks[this.numberOfClicks - 2]);
            if (distance < this.trigonometry.MAX_DISTANCE_BETWEEN_TWO_DOTS) {
                // Replace the ending point received from the click coordinates with the inital point of the line
                this.mouseClicks[this.mouseClicks.length - 1] = this.mouseClicks[0];
                this.storedLines[this.storedLines.length - 1].endingPoint = this.mouseClicks[0];
                this.hasLastPointBeenChanged = true;
            }

            // Draw line on base canvas
            this.updateLineData();
            this.drawFullLine(this.drawingService.baseCtx, this.lineData);
            this.drawingService.updateStack(this.lineData);
            this.hasLastPointBeenChanged = false;

            // Clear the preview canvas, the stored clicks and the stored lines used for previewing
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.storedLines = [];
            this.mouseClicks = [];
            this.isShiftDoubleClick = false;
            this.drawingService.setIsToolInUse(false);
            return;
        }
        this.drawSegment();
        this.drawingService.autoSave();
    }

    drawSegment(): void {
        if (!this.isDrawing) {
            return;
        }
        // Create a new line segment
        this.line = {
            startingPoint: this.mouseClicks[this.numberOfClicks - 2],
            endingPoint: this.endingClickCoordinates,
        };
        // Draw the line with the new segment on preview canvas
        this.drawLine(this.line.startingPoint, this.line.endingPoint, this.drawingService.previewCtx, this.lineWidth);

        // Draw the junction dots
        if (this.isDot) {
            this.drawDots(this.dotWidth, this.drawingService.previewCtx);
        }
        // Add the new line segment to the stored lines
        this.storedLines.push(this.line);

        // Replace last click with the good coordinates
        this.mouseClicks[this.mouseClicks.length - 1] = this.endingClickCoordinates;
    }

    onMouseMove(event: MouseEvent): void {
        this.mouseEvent = event;
        if (!this.isDrawing) return;

        // Clear the old line segment preview
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        // Restore previous line segments
        this.storedLines.forEach((line) => {
            this.drawLine(line.startingPoint, line.endingPoint, this.drawingService.previewCtx, this.lineWidth);
        });

        if (this.isDot) {
            this.drawDots(this.dotWidth, this.drawingService.previewCtx);
        }

        if (this.isShiftKeyDown) {
            // Handle angles (set a different ending coordinates depending on mouse position)
            this.adjustLineAngle(this.getPositionFromMouse(event));
        } else {
            // Get new coordinates for end of line
            this.endingClickCoordinates = this.getPositionFromMouse(event);
        }
        // Draw the new line preview
        this.drawLine(this.mouseClicks[this.numberOfClicks - 1], this.endingClickCoordinates, this.drawingService.previewCtx, this.lineWidth);
    }

    checkIfDoubleClick(): boolean {
        const previousClickX = this.mouseClicks[this.numberOfClicks - 2].x;
        const previousClickY = this.mouseClicks[this.numberOfClicks - 2].y;
        const currentClickX = this.mouseClicks[this.numberOfClicks - 1].x;
        const currentClickY = this.mouseClicks[this.numberOfClicks - 1].y;
        if (previousClickX === currentClickX && previousClickY === currentClickY) {
            return true;
        }
        return false;
    }

    onKeyDown(event: KeyboardEvent): void {
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';
        if (event.key === 'Shift') {
            this.isShiftKeyDown = true;
            this.onMouseMove(this.mouseEvent);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        switch (event.key) {
            case 'Shift': {
                this.isShiftKeyDown = false;
                this.onMouseMove(this.mouseEvent);
                break;
            }
            case 'Backspace': {
                if (this.numberOfClicks > 1) {
                    this.deleteLastSegment();
                }
                break;
            }
            case 'Escape': {
                this.deleteLine();
                break;
            }
        }
    }

    deleteLastSegment(): void {
        this.storedLines.pop();
        this.mouseClicks.pop();
        --this.numberOfClicks;

        // Clear the old line segment preview
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        // Restore previous line segments
        this.storedLines.forEach((line) => {
            this.drawLine(line.startingPoint, line.endingPoint, this.drawingService.previewCtx, this.lineWidth);
        });

        // Draw the new line preview
        this.drawLine(this.mouseClicks[this.numberOfClicks - 1], this.endingClickCoordinates, this.drawingService.previewCtx, this.lineWidth);

        if (this.isDot) {
            this.drawDots(this.dotWidth, this.drawingService.previewCtx);
        }
    }

    deleteLine(): void {
        this.storedLines = [];
        this.mouseClicks = [];
        this.numberOfClicks = 0;
        this.isDrawing = false;
        // Clear the old line segment preview
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    adjustLineAngle(mouseCoordinates: Vec2): void {
        let opposite: number;
        let adjacent: number;
        let hypothenuse: number;
        let angleDegree: number;
        let angleRadians: number;
        let quadrant: Quadrant;
        let lineAngle: LineAngle;

        adjacent = mouseCoordinates.x - this.mouseClicks[this.mouseClicks.length - 1].x;
        opposite = this.mouseClicks[this.mouseClicks.length - 1].y - mouseCoordinates.y;

        hypothenuse = Math.sqrt(Math.pow(opposite, 2) + Math.pow(adjacent, 2));
        quadrant = this.trigonometry.findCursorQuadrant(adjacent, opposite);

        // Make adjacent and opposite values positive if they are negative
        adjacent = Math.abs(adjacent);
        opposite = Math.abs(opposite);

        if (!hypothenuse) {
            hypothenuse = 1;
        }
        angleRadians = Math.asin(opposite / hypothenuse);
        angleDegree = this.trigonometry.radiansToDegrees(angleRadians);
        lineAngle = this.trigonometry.findClosestAngle(quadrant, angleDegree);
        this.endingClickCoordinates = this.trigonometry.adjustEndingPoint(lineAngle, mouseCoordinates, adjacent, this.mouseClicks);
    }

    drawLine(startingPoint: Vec2, endingPoint: Vec2, ctx: CanvasRenderingContext2D, lineWidth: number): void {
        ctx.strokeStyle = this.colorSelectionService.primaryColor;
        ctx.lineCap = 'round';
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(startingPoint.x, startingPoint.y);
        ctx.lineTo(endingPoint.x, endingPoint.y);
        ctx.stroke();
    }

    drawDots(width: number, ctx: CanvasRenderingContext2D): void {
        let lastDot = this.mouseClicks.length;

        if (ctx === this.drawingService.baseCtx) {
            lastDot--;
            this.mouseClicks[this.mouseClicks.length - 2] = this.mouseClicks[this.mouseClicks.length - 1];
            this.mouseClicks.pop();
            if (this.isShiftDoubleClick) {
                this.mouseClicks[this.mouseClicks.length - 1] = this.storedLines[this.storedLines.length - 1].endingPoint;
            }
        }
        for (let i = 0; i < lastDot; i++) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = this.colorSelectionService.secondaryColor;
            ctx.fillStyle = this.colorSelectionService.secondaryColor;
            ctx.beginPath();
            ctx.arc(this.mouseClicks[i].x, this.mouseClicks[i].y, width / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
    }

    drawFullLine(ctx: CanvasRenderingContext2D, line: Line): void {
        line.storedLines.forEach((element) => {
            ctx.strokeStyle = line.primaryColor;
            ctx.lineCap = 'round';
            ctx.lineWidth = line.lineWidth;
            ctx.beginPath();
            ctx.moveTo(element.startingPoint.x, element.startingPoint.y);
            ctx.lineTo(element.endingPoint.x, element.endingPoint.y);
            ctx.stroke();
        });

        if (line.isDot) {
            const LAST_DOT = line.mouseClicks.length;
            let doubleClickPoint: Vec2 | undefined;

            // Remove the double click that doesnt need to be drawed on the canvas
            if (line.hasLastPointBeenChaged) {
                line.mouseClicks[line.mouseClicks.length - 2] = line.mouseClicks[line.mouseClicks.length - 1];
                doubleClickPoint = line.mouseClicks.pop();
            }
            // If it's a double click holding shift adjust ending dot
            if (line.isShiftDoubleClick) {
                line.mouseClicks[line.mouseClicks.length - 1] = line.storedLines[line.storedLines.length - 1].endingPoint;
            }

            for (let i = 0; i < LAST_DOT - 1; i++) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = line.secondaryColor;
                ctx.fillStyle = line.secondaryColor;
                ctx.beginPath();
                ctx.arc(line.mouseClicks[i].x, line.mouseClicks[i].y, line.dotWidth / 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }

            if (line.hasLastPointBeenChaged) {
                line.mouseClicks.push(doubleClickPoint as Vec2);
            }
        }
    }

    private updateLineData(): void {
        this.lineData = {
            type: 'line',
            lineWidth: this.lineWidth,
            lineCap: 'round',
            primaryColor: this.colorSelectionService.primaryColor,
            secondaryColor: this.colorSelectionService.secondaryColor,
            mouseClicks: this.mouseClicks,
            storedLines: this.storedLines,
            isDot: this.isDot,
            line: this.line,
            isShiftDoubleClick: this.isShiftDoubleClick,
            hasLastPointBeenChaged: this.hasLastPointBeenChanged,
            dotWidth: this.dotWidth,
        };
    }
}
