import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Pencil } from '@app/classes/tool-properties';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService extends Tool {
    isUndoAvailable: boolean = false;
    isUndoAvailableSubject: Subject<boolean> = new Subject<boolean>();
    isRedoAvailable: boolean = false;
    isRedoAvailableSubject: Subject<boolean> = new Subject<boolean>();
    isShiftDown: boolean = false;
    isControlDown: boolean = false;
    isZDown: boolean = false;

    constructor(
        public drawingService: DrawingService,
        public pencilService: PencilService,
    ) {
        super(drawingService);
        this.drawingService.getIsToolInUse().subscribe((value) => {
            if (value) {
                this.setUndoAvailability(false);
                this.setRedoAvailability(false);
            } else {
                this.setUndoAvailability(true);
                this.setRedoAvailability(true);
                this.changeUndoAvailability();
                this.changeRedoAvailability();
            }
        });
    }

    setUndoAvailability(isAvailable: boolean): void {
        this.isUndoAvailable = isAvailable;
        this.isUndoAvailableSubject.next(isAvailable);
    }

    setRedoAvailability(isAvailable: boolean): void {
        this.isRedoAvailable = isAvailable;
        this.isRedoAvailableSubject.next(isAvailable);
    }

    getUndoAvailability(): Observable<boolean> {
        return this.isUndoAvailableSubject.asObservable();
    }

    getRedoAvailability(): Observable<boolean> {
        return this.isRedoAvailableSubject.asObservable();
    }

    undo(): void {
        this.changeUndoAvailability();
        this.changeRedoAvailability();
        if (!this.isUndoAvailable) {
            return;
        }
        const modification = this.drawingService.undoStack.pop();
        if (modification !== undefined) {
            this.drawingService.redoStack.push(modification);
        }
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        this.drawingService.undoStack.forEach((element) => {
            this.drawElement(element);
        });
        this.changeUndoAvailability();
        this.changeRedoAvailability();
    }

    redo(): void {
        this.changeUndoAvailability();
        this.changeRedoAvailability();
        if (!this.isRedoAvailable) {
            return;
        }
        const redoStackLength = this.drawingService.redoStack.length;
        if (redoStackLength) {
            const element = this.drawingService.redoStack[redoStackLength - 1];
            this.drawElement(element);
            const modification = this.drawingService.redoStack.pop();
            if (modification !== undefined) {
                this.drawingService.undoStack.push(modification);
            }
        }
        this.changeUndoAvailability();
        this.changeRedoAvailability();
    }

    changeUndoAvailability(): void {
        if (this.drawingService.undoStack.length) {
            this.setUndoAvailability(true);
        } else {
            this.setUndoAvailability(false);
        }
    }

    changeRedoAvailability(): void {
        if (this.drawingService.redoStack.length) {
            this.setRedoAvailability(true);
        } else {
            this.setRedoAvailability(false);
        }
    }

    drawElement(element: Pencil): void {
        switch (element.type) {
            case 'pencil':
                this.pencilService.drawPencilStroke(this.drawingService.baseCtx, element as Pencil);
                break;
        }
    }
}
