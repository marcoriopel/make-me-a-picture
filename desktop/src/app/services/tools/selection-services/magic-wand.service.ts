import { Injectable } from '@angular/core';
import { SelectionBox } from '@app/classes/selection-box';
import { Selection } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import {
    MAGIC_WAND_BORDER_BOTH_SIDES,
    MAGIC_WAND_BORDER_ONE_SIDE,
    MAX_PERCENTAGE,
    MouseButton,
    OFFSET,
} from '@app/ressources/global-variables/global-variables';
import { MAXIMUM_RGBA_VALUE, RGBA_INDEXER, RGBA_LENGTH } from '@app/ressources/global-variables/rgba';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ClipboardService } from '@app/services/clipboard/clipboard.service';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MoveService } from '@app/services/tools/transformation-services/move.service';
import { RotateService } from '@app/services/tools/transformation-services/rotate.service';
import { MagnetismService } from './magnetism.service';
import { SelectionResizeService } from './selection-resize.service';
import { SelectionService } from './selection.service';

@Injectable({
    providedIn: 'root',
})
export class MagicWandService extends SelectionService {
    name: string = TOOL_NAMES.MAGIC_WAND_TOOL_NAME;
    mouseDownCoord: Vec2;
    stack: Vec2[];
    isShiftKeyDown: boolean = false;
    selectionData: Selection;
    initialSelection: SelectionBox = { startingPoint: { x: 0, y: 0 }, width: 0, height: 0 };
    selectionImageCtx: CanvasRenderingContext2D = this.selectionImage.getContext('2d') as CanvasRenderingContext2D;
    transormation: string = '';
    isNewSelection: boolean = false;
    pixelData: Uint8ClampedArray;
    tolerance: number = 15;
    secondaryTolerance: number = 50;
    selectionImageData: ImageData;
    borderCanvas: HTMLCanvasElement = document.createElement('canvas');
    borderCanvasCtx: CanvasRenderingContext2D = this.borderCanvas.getContext('2d') as CanvasRenderingContext2D;
    cornerSelectionValues: Map<string, number> = new Map([
        ['minX', 0],
        ['maxX', 0],
        ['minY', 0],
        ['maxY', 0],
    ]);

    constructor(
        drawingService: DrawingService,
        public moveService: MoveService,
        public rotateService: RotateService,
        public magnetismService: MagnetismService,
        public colorSelectionService: ColorSelectionService,
        public clipboardService: ClipboardService,
        public selectionResizeService: SelectionResizeService,
    ) {
        super(drawingService, moveService, rotateService, clipboardService, magnetismService, selectionResizeService);
    }

    setMagnetismAlignment(alignment: string): void {
        this.currentAlignment = alignment;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDownCoord = this.getPositionFromMouse(event);
        if (!this.isInSelection(event)) {
            this.isNewSelection = true;
            if (!this.moveService.isTransformationOver) {
                this.moveService.isTransformationOver = true;
                this.moveService.printSelectionOnPreview();
                this.applyPreview();
            }
            if (!this.rotateService.isRotationOver) {
                this.rotateService.restoreSelection();
                this.applyPreview();
            }
            this.selection = { startingPoint: { x: 0, y: 0 }, width: 0, height: 0 };
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            if (event.button === MouseButton.LEFT && this.isSelectionOver) {
                this.setContiguousWand();
            } else if (event.button === MouseButton.RIGHT && this.isSelectionOver) {
                this.setWand();
            }
            this.isSelectionOver = true;
        } else {
            this.isSelectionOver = false;
            this.mouseDownCoord.x = event.x;
            this.mouseDownCoord.y = event.y;
            this.transormation = 'move';
            this.moveService.onMouseDown(event);
        }
        this.drawingService.setIsToolInUse(true);
    }

    onMouseUp(event: MouseEvent): void {
        if (this.isNewSelection) {
            if (this.selection.height !== 0 && this.selection.width !== 0) {
                this.isSelectionOver = false;
                this.setSelection(this.initialSelection, this.selection);
                this.updateSelectionCorners();
                this.setSelectionCorners();
            }
            this.isNewSelection = false;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        } else if (this.transormation === 'move') {
            this.transormation = '';
            this.updateSelectionCorners();
            this.setSelectionCorners();
        }
        this.updateSelectionCorners();
        this.strokeSelection();
        this.setSelectionPoint();
        this.drawingService.setIsToolInUse(false);
    }

    onKeyUp(event: KeyboardEvent): void {
        this.moveService.onKeyUp(event);
        this.rotateService.onKeyUp(event);
        this.updateSelectionCorners();
        this.strokeSelection();
        this.setSelectionPoint();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.transormation === 'move') {
            if (this.isMagnetism) {
                const mousePosDifferenceX = event.x - this.mouseDownCoord.x;
                const mousePosDifferenceY = event.y - this.mouseDownCoord.y;
                this.onMouseMoveMagnetism(mousePosDifferenceX, mousePosDifferenceY);
            } else {
                this.moveService.onMouseMove(event.movementX, event.movementY);
            }
        }
    }

    adjustCornerSelectionValues(value: Vec2): void {
        if (value.x < (this.cornerSelectionValues.get('minX') as number)) {
            this.cornerSelectionValues.set('minX', value.x);
        } else if (value.x > (this.cornerSelectionValues.get('maxX') as number)) {
            this.cornerSelectionValues.set('maxX', value.x);
        }
        if (value.y < (this.cornerSelectionValues.get('minY') as number)) {
            this.cornerSelectionValues.set('minY', value.y);
        } else if (value.y > (this.cornerSelectionValues.get('maxY') as number)) {
            this.cornerSelectionValues.set('maxY', value.y);
        }
    }

    setContiguousWand(): void {
        this.pixelData = this.drawingService.getPixelData(this.mouseDownCoord);
        this.stack = [this.mouseDownCoord];
        const selectedPixels: Map<string, boolean> = new Map();
        this.cornerSelectionValues = new Map([
            ['minX', this.mouseDownCoord.x],
            ['maxX', this.mouseDownCoord.x],
            ['minY', this.mouseDownCoord.y],
            ['maxY', this.mouseDownCoord.y],
        ]);
        const canvasData: ImageData = this.drawingService.getCanvasData();
        this.selectionImageData = new ImageData(this.drawingService.canvas.width, this.drawingService.canvas.height);

        while (this.stack.length) {
            const currentPixel = this.stack.pop() as Vec2;
            const index = (currentPixel.x + currentPixel.y * this.drawingService.canvas.width) * RGBA_LENGTH;
            if (selectedPixels.has(this.Vec2ToString(currentPixel))) {
                continue;
            }
            if (this.isSameColor(this.pixelData, canvasData, index, this.tolerance)) {
                this.addPixelToSelection(index, canvasData);
                this.adjustCornerSelectionValues(currentPixel);
                selectedPixels.set(this.Vec2ToString(currentPixel), true);
                this.nextContiguousPixels(currentPixel, canvasData);
            }
        }
        this.setSelectionWithCorners();

        this.setSelectionData();
    }

    setSelectionWithCorners(): void {
        this.selection = {
            startingPoint: {
                x: (this.cornerSelectionValues.get('minX') as number) - MAGIC_WAND_BORDER_ONE_SIDE,
                y: (this.cornerSelectionValues.get('minY') as number) - MAGIC_WAND_BORDER_ONE_SIDE,
            },
            height:
                (this.cornerSelectionValues.get('maxY') as number) -
                (this.cornerSelectionValues.get('minY') as number) +
                MAGIC_WAND_BORDER_BOTH_SIDES,
            width:
                (this.cornerSelectionValues.get('maxX') as number) -
                (this.cornerSelectionValues.get('minX') as number) +
                MAGIC_WAND_BORDER_BOTH_SIDES,
        };
    }

    nextContiguousPixels(currentPixel: Vec2, canvasData: ImageData): void {
        if (currentPixel.y - 1 >= 0) {
            const index = (currentPixel.x + (currentPixel.y - 1) * this.drawingService.canvas.width) * RGBA_LENGTH;
            if (this.isSameColor(this.pixelData, canvasData, index, this.tolerance)) {
                this.stack.push({ x: currentPixel.x, y: currentPixel.y - 1 });
            } else {
                this.addSecondaryTolerance(this.pixelData, index, canvasData, { x: currentPixel.x, y: currentPixel.y - 1 });
            }
        }
        if (currentPixel.y + 1 < this.drawingService.canvas.height) {
            const index = (currentPixel.x + (currentPixel.y + 1) * this.drawingService.canvas.width) * RGBA_LENGTH;
            if (this.isSameColor(this.pixelData, canvasData, index, this.tolerance)) {
                this.stack.push({ x: currentPixel.x, y: currentPixel.y + 1 });
            } else {
                this.addSecondaryTolerance(this.pixelData, index, canvasData, { x: currentPixel.x, y: currentPixel.y + 1 });
            }
        }
        if (currentPixel.x + 1 < this.drawingService.canvas.width) {
            const index = (currentPixel.x + 1 + currentPixel.y * this.drawingService.canvas.width) * RGBA_LENGTH;
            if (this.isSameColor(this.pixelData, canvasData, index, this.tolerance)) {
                this.stack.push({ x: currentPixel.x + 1, y: currentPixel.y });
            } else {
                this.addSecondaryTolerance(this.pixelData, index, canvasData, { x: currentPixel.x + 1, y: currentPixel.y });
            }
        }
        if (currentPixel.x - 1 >= 0) {
            const index = (currentPixel.x - 1 + currentPixel.y * this.drawingService.canvas.width) * RGBA_LENGTH;
            if (this.isSameColor(this.pixelData, canvasData, index, this.tolerance)) {
                this.stack.push({ x: currentPixel.x - 1, y: currentPixel.y });
            } else {
                this.addSecondaryTolerance(this.pixelData, index, canvasData, { x: currentPixel.x - 1, y: currentPixel.y });
            }
        }
    }

    addPixelToSelection(index: number, canvasData: ImageData): void {
        this.selectionImageData.data[index + RGBA_INDEXER.RED] = canvasData.data[index + RGBA_INDEXER.RED];
        this.selectionImageData.data[index + RGBA_INDEXER.GREEN] = canvasData.data[index + RGBA_INDEXER.GREEN];
        this.selectionImageData.data[index + RGBA_INDEXER.BLUE] = canvasData.data[index + RGBA_INDEXER.BLUE];
        this.selectionImageData.data[index + RGBA_INDEXER.ALPHA] = canvasData.data[index + RGBA_INDEXER.ALPHA];
    }

    addSecondaryTolerance(pixelData: Uint8ClampedArray, index: number, canvasData: ImageData, currentPixel: Vec2): void {
        if (!this.isSameColor(pixelData, canvasData, index, this.secondaryTolerance)) return;
        this.adjustCornerSelectionValues(currentPixel);
        this.addPixelToSelection(index, canvasData);
    }

    setSelectionData(): void {
        this.selectionImage.width = this.selection.width;
        this.selectionImage.height = this.selection.height;
        this.selectionImageCtx.putImageData(this.selectionImageData, -this.selection.startingPoint.x, -this.selection.startingPoint.y);
        this.moveService.initialize(this.selection, this.selectionImage);
        this.rotateService.initialize(this.selection, this.selectionImage);
        this.drawingService.updateStack(this.selectionData);
    }

    strokeSelection(): void {
        if (this.selection.height !== 0 && this.selection.width !== 0) {
            this.drawingService.previewCtx.save();
            this.rotateService.rotatePreviewCanvas();
            this.setBorderCanvas();
            this.drawingService.previewCtx.strokeRect(
                this.selection.startingPoint.x,
                this.selection.startingPoint.y,
                this.selection.width,
                this.selection.height,
            );
            this.drawingService.previewCtx.restore();

            // this.initialSelectionCorners.topLeft.coordinates.x = this.selection.startingPoint.x;
            // this.initialSelectionCorners.topLeft.coordinates.y = this.selection.startingPoint.y;

            const center = this.rotateService.calculateCenter();

            // BOITE ENGLOBANTE ICI!
            const highestVerticalSelectionPoint = Math.max(
                this.selectionCorners.topRight.coordinates.y,
                this.selectionCorners.bottomRight.coordinates.y,
                this.selectionCorners.topLeft.coordinates.y,
                this.selectionCorners.bottomLeft.coordinates.y,
            );
            this.selectionContour.height = (highestVerticalSelectionPoint - center.y) * 2;

            const highestHorizontalSelectionPoint = Math.max(
                this.selectionCorners.topRight.coordinates.x,
                this.selectionCorners.bottomRight.coordinates.x,
                this.selectionCorners.topLeft.coordinates.x,
                this.selectionCorners.bottomLeft.coordinates.x,
            );
            this.selectionContour.width = (highestHorizontalSelectionPoint - center.x) * 2;

            this.selectionContour.startingPoint.x = center.x - this.selectionContour.width / 2;
            this.selectionContour.startingPoint.y = center.y - this.selectionContour.height / 2;

            this.drawingService.previewCtx.strokeRect(
                this.selectionContour.startingPoint.x,
                this.selectionContour.startingPoint.y,
                this.selectionContour.width,
                this.selectionContour.height,
            );
            this.setSelectionPoint();
        }
    }

    setBorderPattern(): CanvasPattern {
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = MAGIC_WAND_BORDER_BOTH_SIDES;
        patternCanvas.height = MAGIC_WAND_BORDER_BOTH_SIDES;
        const patternCtx = patternCanvas.getContext('2d') as CanvasRenderingContext2D;
        patternCtx.fillStyle = 'rgb(0, 0, 0)';
        patternCtx.fillRect(0, 0, 2, 2);
        patternCtx.fillRect(2, 2, 2, 2);
        return patternCtx.createPattern(patternCanvas, 'repeat') as CanvasPattern;
    }

    setBorderCanvas(): void {
        this.borderCanvas.width = this.selectionImage.width + MAGIC_WAND_BORDER_BOTH_SIDES;
        this.borderCanvas.height = this.selectionImage.height + MAGIC_WAND_BORDER_BOTH_SIDES;
        const dArr = [OFFSET, OFFSET, 0, OFFSET, 1, OFFSET, OFFSET, 0, 1, 0, OFFSET, 1, 0, 1, 1, 1];

        for (let i = 0; i < dArr.length; i += 2)
            this.borderCanvasCtx.drawImage(
                this.selectionImage,
                MAGIC_WAND_BORDER_ONE_SIDE + dArr[i] * MAGIC_WAND_BORDER_ONE_SIDE,
                MAGIC_WAND_BORDER_ONE_SIDE + dArr[i + 1] * MAGIC_WAND_BORDER_ONE_SIDE,
            );
        this.borderCanvasCtx.globalCompositeOperation = 'source-in';
        this.borderCanvasCtx.fillStyle = this.setBorderPattern();
        this.borderCanvasCtx.fillRect(0, 0, this.borderCanvas.width, this.borderCanvas.height);
        this.borderCanvasCtx.globalCompositeOperation = 'source-over';
        this.borderCanvasCtx.drawImage(this.selectionImage, MAGIC_WAND_BORDER_ONE_SIDE, MAGIC_WAND_BORDER_ONE_SIDE);
        this.drawingService.previewCtx.drawImage(
            this.borderCanvas,
            this.selection.startingPoint.x - MAGIC_WAND_BORDER_ONE_SIDE,
            this.selection.startingPoint.y - MAGIC_WAND_BORDER_ONE_SIDE,
        );
    }

    setWand(): void {
        this.pixelData = this.drawingService.getPixelData(this.mouseDownCoord);
        this.cornerSelectionValues = new Map([
            ['minX', this.mouseDownCoord.x],
            ['maxX', this.mouseDownCoord.x],
            ['minY', this.mouseDownCoord.y],
            ['maxY', this.mouseDownCoord.y],
        ]);
        const canvasData: ImageData = this.drawingService.getCanvasData();
        this.selectionImageData = new ImageData(this.drawingService.canvas.width, this.drawingService.canvas.height);
        for (let index = 0; index < canvasData.data.length; index += RGBA_LENGTH) {
            if (this.isSameColor(this.pixelData, canvasData, index, this.tolerance)) {
                this.addPixelToSelection(index, canvasData);
                const currentPixel: Vec2 = {
                    x: (index / RGBA_LENGTH) % this.drawingService.canvas.width,
                    y: Math.floor(index / RGBA_LENGTH / this.drawingService.canvas.width),
                };
                this.adjustCornerSelectionValues(currentPixel);
            }
        }
        this.setSelectionWithCorners();
        this.setSelectionData();
    }

    isSameColor(pixelData: Uint8ClampedArray, canvasData: ImageData, index: number, tolerance: number): boolean {
        const diffRed: number = Math.abs(pixelData[RGBA_INDEXER.RED] - canvasData.data[index + RGBA_INDEXER.RED]);
        const diffGreen: number = Math.abs(pixelData[RGBA_INDEXER.GREEN] - canvasData.data[index + RGBA_INDEXER.GREEN]);
        const diffBlue: number = Math.abs(pixelData[RGBA_INDEXER.BLUE] - canvasData.data[index + RGBA_INDEXER.BLUE]);
        const diffAlpha: number = Math.abs(pixelData[RGBA_INDEXER.ALPHA] - canvasData.data[index + RGBA_INDEXER.ALPHA]);
        const diffPercentage: number = ((diffRed + diffGreen + diffBlue + diffAlpha) / (RGBA_LENGTH * MAXIMUM_RGBA_VALUE)) * MAX_PERCENTAGE;
        if (diffPercentage > tolerance) {
            return false;
        } else {
            return true;
        }
    }

    Vec2ToString(pixel: Vec2): string {
        return pixel.x.toString() + ',' + pixel.y.toString();
    }
}
