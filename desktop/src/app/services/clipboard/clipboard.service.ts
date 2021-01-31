import { Injectable } from '@angular/core';
import { SelectionBox } from '@app/classes/selection-box';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    selection: SelectionBox = { startingPoint: { x: 0, y: 0 }, width: 0, height: 0 };
    selectionContour: SelectionBox = { startingPoint: { x: 0, y: 0 }, width: 0, height: 0 };
    clipBoardCanvas: HTMLCanvasElement = document.createElement('canvas');
    angle: number;
    selectionType: number;
    isPasteAvailableSubject: Subject<boolean> = new Subject<boolean>();

    constructor(public drawingService: DrawingService) {
        this.isPasteAvailableSubject.next(false);
    }

    copy(selection: SelectionBox, selectionImage: HTMLCanvasElement, angle: number): void {
        this.setSelection(this.selection, selection);
        this.isPasteAvailableSubject.next(true);
        this.clipBoardCanvas.width = this.selection.width;
        this.clipBoardCanvas.height = this.selection.height;
        const selectionImageCtx = this.clipBoardCanvas.getContext('2d') as CanvasRenderingContext2D;
        selectionImageCtx.drawImage(selectionImage, 0, 0, selection.width, selection.height);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.angle = angle;
    }

    resetSelectionPosition(selectionContour: SelectionBox): void {
        this.selection.startingPoint.x -= selectionContour.startingPoint.x;
        this.selection.startingPoint.y -= selectionContour.startingPoint.y;
    }

    private setSelection(selection: SelectionBox, incomingSelection: SelectionBox): void {
        selection.startingPoint.x = incomingSelection.startingPoint.x;
        selection.startingPoint.y = incomingSelection.startingPoint.y;
        selection.width = incomingSelection.width;
        selection.height = incomingSelection.height;
    }

    getIsPasteAvailableSubject(): Observable<boolean> {
        return this.isPasteAvailableSubject.asObservable();
    }
}
