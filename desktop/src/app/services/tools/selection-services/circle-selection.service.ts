import { Injectable } from '@angular/core';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ClipboardService } from '@app/services/clipboard/clipboard.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { CircleService } from '@app/services/tools/circle.service';
import { MoveService } from '@app/services/tools/transformation-services/move.service';
import { RotateService } from '@app/services/tools/transformation-services/rotate.service';
import { MagnetismService } from './magnetism.service';
import { SelectionResizeService } from './selection-resize.service';
import { SelectionService } from './selection.service';

@Injectable({
    providedIn: 'root',
})
export class CircleSelectionService extends SelectionService {
    name: string = TOOL_NAMES.CIRCLE_SELECTION_TOOL_NAME;
    constructor(
        drawingService: DrawingService,
        public circleService: CircleService,
        public moveService: MoveService,
        public rotateService: RotateService,
        public clipboardService: ClipboardService,
        public magnetismService: MagnetismService,
        public selectionResizeService: SelectionResizeService,
    ) {
        super(drawingService, moveService, rotateService, clipboardService, magnetismService, selectionResizeService);
        super.underlyingService = circleService;
    }

    setSelectionData(): void {
        this.selectionImage.width = this.selection.width;
        this.selectionImage.height = this.selection.height;
        const selectionImageCtx = this.selectionImage.getContext('2d') as CanvasRenderingContext2D;

        selectionImageCtx.beginPath();
        selectionImageCtx.ellipse(
            this.selection.width / 2,
            this.selection.height / 2,
            this.selection.width / 2,
            this.selection.height / 2,
            0,
            0,
            Math.PI * 2,
        );
        selectionImageCtx.clip();
        selectionImageCtx.closePath();

        selectionImageCtx.drawImage(
            this.drawingService.canvas,
            this.selection.startingPoint.x,
            this.selection.startingPoint.y,
            this.selection.width,
            this.selection.height,
            0,
            0,
            this.selection.width,
            this.selection.height,
        );
        this.moveService.initialize(this.selection, this.selectionImage);
        this.rotateService.initialize(this.selection, this.selectionImage);
    }

    setMagnetismAlignment(alignment: string): void {
        this.currentAlignment = alignment;
    }

    strokeSelection(): void {
        if (this.selection.height !== 0 && this.selection.width !== 0) {
            this.drawingService.previewCtx.beginPath();
            this.drawingService.previewCtx.save();
            this.rotateService.rotatePreviewCanvas();
            this.drawingService.previewCtx.ellipse(
                this.selection.startingPoint.x + this.selection.width / 2,
                this.selection.startingPoint.y + this.selection.height / 2,
                this.selection.width / 2,
                this.selection.height / 2,
                0,
                0,
                Math.PI * 2,
            );
            this.drawingService.previewCtx.strokeRect(
                this.moveService.selection.startingPoint.x,
                this.moveService.selection.startingPoint.y,
                this.selection.width,
                this.selection.height,
            );
            this.drawingService.previewCtx.restore();
            this.drawingService.previewCtx.stroke();
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
        this.drawingService.autoSave();
    }
}
