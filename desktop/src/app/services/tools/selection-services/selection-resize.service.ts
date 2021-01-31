import { Injectable } from '@angular/core';
import { SelectionBox } from '@app/classes/selection-box';
import { SELECTION_POINTS_NAMES } from '@app/classes/selection-points';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MoveService } from '@app/services/tools/transformation-services/move.service';
import { RotateService } from '../transformation-services/rotate.service';
@Injectable({
    providedIn: 'root',
})
export class SelectionResizeService {
    private selectionBeforeResize: SelectionBox = { startingPoint: { x: 0, y: 0 }, width: 0, height: 0 };
    newSelection: SelectionBox = { startingPoint: { x: 0, y: 0 }, width: 0, height: 0 };
    selection: SelectionBox;
    selectionImage: HTMLCanvasElement = document.createElement('canvas');
    selectionImageCtx: CanvasRenderingContext2D;
    newWidth: number = 0;
    newHeight: number = 0;
    isShiftKeyDown: boolean = false;
    private isHorizontalScaleNegative: boolean = false;
    private isVerticalScaleNegative: boolean = false;
    constructor(public drawingService: DrawingService, public moveService: MoveService, public rotateService: RotateService) {}

    initialize(selection: SelectionBox, selectionImage: HTMLCanvasElement): void {
        this.selection = selection;
        this.selectionImage = selectionImage;
        this.selectionImageCtx = selectionImage.getContext('2d') as CanvasRenderingContext2D;
    }

    setSelectionBeforeResize(selection: SelectionBox): void {
        this.selectionBeforeResize.startingPoint.x = selection.startingPoint.x;
        this.selectionBeforeResize.startingPoint.y = selection.startingPoint.y;
        this.selectionBeforeResize.width = selection.width;
        this.selectionBeforeResize.height = selection.height;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Shift' && !this.isShiftKeyDown) {
            this.isShiftKeyDown = true;
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (this.isShiftKeyDown && event.key === 'Shift') {
            this.isShiftKeyDown = false;
        }
    }

    printSelectionOnBaseCtx(): void {
        this.drawingService.applyPreview();
    }

    resizeSelection(mouseCoordinates: Vec2, selectionPoint: number): SelectionBox {
        switch (selectionPoint) {
            case SELECTION_POINTS_NAMES.BOTTOM_RIGHT: {
                this.resizeBottomRight(mouseCoordinates);
                break;
            }
            case SELECTION_POINTS_NAMES.TOP_MIDDLE: {
                this.resizeTopMiddle(mouseCoordinates);
                break;
            }
            case SELECTION_POINTS_NAMES.BOTTOM_MIDDLE: {
                this.resizeBottomMiddle(mouseCoordinates);
                break;
            }
            case SELECTION_POINTS_NAMES.MIDDLE_LEFT: {
                this.resizeLeftMiddle(mouseCoordinates);
                break;
            }
            case SELECTION_POINTS_NAMES.MIDDLE_RIGHT: {
                this.resizeRightMiddle(mouseCoordinates);
                break;
            }
            case SELECTION_POINTS_NAMES.BOTTOM_LEFT: {
                this.resizeBottomLeft(mouseCoordinates);
                break;
            }
            case SELECTION_POINTS_NAMES.TOP_RIGHT: {
                this.resizeTopRight(mouseCoordinates);
                break;
            }
            case SELECTION_POINTS_NAMES.TOP_LEFT: {
                this.resizeTopLeft(mouseCoordinates);
                break;
            }
        }
        const newSelection = this.drawSelectionOnPreviewCtx(mouseCoordinates);
        return newSelection;
    }

    resizeTopMiddle(mouseCoordinates: Vec2): void {
        if (this.isShiftKeyDown) return;
        const bottomY: number = this.selection.startingPoint.y + this.selection.height;
        this.newSelection.width = this.selection.width;
        this.newSelection.height = bottomY - mouseCoordinates.y;
        this.selection.startingPoint.y = mouseCoordinates.y;
    }

    resizeBottomMiddle(mouseCoordinates: Vec2): void {
        if (this.isShiftKeyDown) return;
        this.newSelection.width = this.selection.width;
        this.newSelection.height = mouseCoordinates.y - this.selection.startingPoint.y;
    }

    resizeLeftMiddle(mouseCoordinates: Vec2): void {
        if (this.isShiftKeyDown) return;
        const rightX: number = this.selection.startingPoint.x + this.selection.width;
        this.newSelection.height = this.selection.height;
        this.newSelection.width = rightX - mouseCoordinates.x;
        this.selection.startingPoint.x = mouseCoordinates.x;
    }

    resizeRightMiddle(mouseCoordinates: Vec2): void {
        if (this.isShiftKeyDown) return;
        this.newSelection.height = this.selection.height;
        this.newSelection.width = mouseCoordinates.x - this.selection.startingPoint.x;
    }

    resizeBottomLeft(mouseCoordinates: Vec2): void {
        if (this.isShiftKeyDown) {
            const referenceCoordinates: Vec2 = {
                x: this.selectionBeforeResize.startingPoint.x + this.selectionBeforeResize.width,
                y: this.selectionBeforeResize.startingPoint.y,
            };
            this.isHorizontalScaleNegative = true;
            this.isVerticalScaleNegative = false;
            this.adjustSelectionAspectRatio(referenceCoordinates, mouseCoordinates);
            this.selection.startingPoint.x = referenceCoordinates.x - this.newSelection.width;
        } else {
            const topRightCorner: Vec2 = {
                x: this.selectionBeforeResize.startingPoint.x + this.selectionBeforeResize.width,
                y: this.selectionBeforeResize.startingPoint.y,
            };
            this.newSelection.width = topRightCorner.x - mouseCoordinates.x;
            this.newSelection.height = mouseCoordinates.y - topRightCorner.y;
            this.selection.startingPoint.x = mouseCoordinates.x;
        }
    }

    resizeTopRight(mouseCoordinates: Vec2): void {
        if (this.isShiftKeyDown) {
            const referenceCoordinates: Vec2 = {
                x: this.selectionBeforeResize.startingPoint.x,
                y: this.selectionBeforeResize.startingPoint.y + this.selectionBeforeResize.height,
            };
            this.isHorizontalScaleNegative = false;
            this.isVerticalScaleNegative = true;
            this.adjustSelectionAspectRatio(referenceCoordinates, mouseCoordinates);
            this.selection.startingPoint.y = referenceCoordinates.y - this.newSelection.height;
        } else {
            const bottomLeftCorner: Vec2 = {
                x: this.selectionBeforeResize.startingPoint.x,
                y: this.selectionBeforeResize.startingPoint.y + this.selectionBeforeResize.height,
            };
            this.newSelection.width = mouseCoordinates.x - bottomLeftCorner.x;
            this.newSelection.height = bottomLeftCorner.y - mouseCoordinates.y;
            this.selection.startingPoint.y = mouseCoordinates.y;
        }
    }

    resizeTopLeft(mouseCoordinates: Vec2): void {
        if (this.isShiftKeyDown) {
            const referenceCoordinates: Vec2 = {
                x: this.selectionBeforeResize.startingPoint.x + this.selectionBeforeResize.width,
                y: this.selectionBeforeResize.startingPoint.y + this.selectionBeforeResize.height,
            };
            this.isHorizontalScaleNegative = true;
            this.isVerticalScaleNegative = true;
            this.adjustSelectionAspectRatio(referenceCoordinates, mouseCoordinates);

            this.selection.startingPoint.y = referenceCoordinates.y - this.newSelection.height;
            this.selection.startingPoint.x = referenceCoordinates.x - this.newSelection.width;
        } else {
            const bottomRightCorner: Vec2 = {
                x: this.selectionBeforeResize.startingPoint.x + this.selectionBeforeResize.width,
                y: this.selectionBeforeResize.startingPoint.y + this.selectionBeforeResize.height,
            };
            this.newSelection.width = bottomRightCorner.x - mouseCoordinates.x;
            this.newSelection.height = bottomRightCorner.y - mouseCoordinates.y;
            this.selection.startingPoint.y = mouseCoordinates.y;
            this.selection.startingPoint.x = mouseCoordinates.x;
        }
    }

    resizeBottomRight(mouseCoordinates: Vec2): void {
        if (this.isShiftKeyDown) {
            const referenceCoordinates: Vec2 = {
                x: this.selectionBeforeResize.startingPoint.x,
                y: this.selectionBeforeResize.startingPoint.y,
            };
            this.isHorizontalScaleNegative = false;
            this.isVerticalScaleNegative = false;
            this.adjustSelectionAspectRatio(referenceCoordinates, mouseCoordinates);
        } else {
            this.newSelection.width = mouseCoordinates.x - this.selection.startingPoint.x;
            this.newSelection.height = mouseCoordinates.y - this.selection.startingPoint.y;
        }
    }

    adjustSelectionAspectRatio(referenceCoordinates: Vec2, mouseCoordinates: Vec2): void {
        let offsetX = mouseCoordinates.x - referenceCoordinates.x;
        let offsetY = mouseCoordinates.y - referenceCoordinates.y;

        if (this.isHorizontalScaleNegative) {
            offsetX *= -1;
        }
        if (this.isVerticalScaleNegative) {
            offsetY *= -1;
        }
        this.isVerticalScaleNegative = false;
        this.isHorizontalScaleNegative = false;
        let isOffsetXNegative = false;
        let isOffsetYNegative = false;

        if (offsetX < 0) {
            isOffsetXNegative = true;
        }
        if (offsetY < 0) {
            isOffsetYNegative = true;
        }
        const widthHeightRatio = this.selectionBeforeResize.width / this.selectionBeforeResize.height;
        let smallestOffset = 0;
        if (Math.abs(offsetX) > Math.abs(offsetY)) {
            smallestOffset = Math.abs(offsetY);
        } else {
            smallestOffset = Math.abs(offsetX);
        }
        if (isOffsetXNegative) {
            this.newSelection.width = -(smallestOffset * widthHeightRatio);
        } else {
            this.newSelection.width = smallestOffset * widthHeightRatio;
        }
        if (isOffsetYNegative) {
            this.newSelection.height = -smallestOffset;
        } else {
            this.newSelection.height = smallestOffset;
        }
    }

    drawSelectionOnPreviewCtx(mouseCoordinates: Vec2): SelectionBox {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.moveService.clearSelectionBackground();
        this.drawingService.previewCtx.save();
        this.rotateService.rotatePreviewCanvas();

        if (this.newSelection.width < 0 && this.newSelection.height > 0) {
            this.drawingService.previewCtx.scale(-1, 1);
            this.drawingService.previewCtx.drawImage(
                this.selectionImage,
                -this.selection.startingPoint.x,
                this.selection.startingPoint.y,
                -this.newSelection.width,
                this.newSelection.height,
            );
        } else if (this.newSelection.height < 0 && this.newSelection.width > 0) {
            this.drawingService.previewCtx.scale(1, -1);
            this.drawingService.previewCtx.drawImage(
                this.selectionImage,
                this.selection.startingPoint.x,
                -this.selection.startingPoint.y,
                this.newSelection.width,
                -this.newSelection.height,
            );
        } else if (this.newSelection.height < 0 && this.newSelection.width < 0) {
            this.drawingService.previewCtx.scale(-1, -1);
            this.drawingService.previewCtx.drawImage(
                this.selectionImage,
                -this.selection.startingPoint.x,
                -this.selection.startingPoint.y,
                -this.newSelection.width,
                -this.newSelection.height,
            );
        } else {
            this.drawingService.previewCtx.drawImage(
                this.selectionImage,
                this.selection.startingPoint.x,
                this.selection.startingPoint.y,
                this.newSelection.width,
                this.newSelection.height,
            );
        }

        const newSelection: SelectionBox = {
            startingPoint: {
                x: this.selection.startingPoint.x,
                y: this.selection.startingPoint.y,
            },
            width: this.newSelection.width,
            height: this.newSelection.height,
        };

        this.drawingService.previewCtx.restore();

        return newSelection;
    }
}
