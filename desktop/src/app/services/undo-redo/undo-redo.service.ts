import { Injectable } from '@angular/core';
import { Stroke } from '@app/classes/drawing';
import { DrawingEvent, drawingEventType } from '@app/classes/game';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil.service';
import { Observable, Subject } from 'rxjs';
import { GameService } from '../game/game.service';
import { SocketService } from '../socket/socket.service';

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
        private socketService: SocketService,
        private gameService: GameService,
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
        this.drawingService.strokeNumber--;
        this.drawingService.strokes.pop();
        const modification = this.drawingService.strokeStack.pop();
        if (modification !== undefined) {
            this.drawingService.redoStack.push(modification);
        }
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        this.drawingService.strokeStack.forEach((element) => {
            this.drawElement(element);
        });
        this.changeUndoAvailability();
        this.changeRedoAvailability();
        if(this.gameService.drawingPlayer == localStorage.getItem('username')){
            const event: DrawingEvent = {
                event: {},
                eventType: drawingEventType.UNDO,
                gameId: this.gameService.gameId
            }
            this.socketService.emit('drawingEvent', event);        
        }
    }

    redo(): void {
        this.changeUndoAvailability();
        this.changeRedoAvailability();
        if (!this.isRedoAvailable) {
            return;
        }
        this.drawingService.strokeNumber++;
        const redoStackLength = this.drawingService.redoStack.length;
        if (redoStackLength) {
            const element = this.drawingService.redoStack[redoStackLength - 1];
            this.drawElement(element);
            const modification = this.drawingService.redoStack.pop();
            if (modification !== undefined) {
                this.drawingService.strokeStack.push(modification);
                this.drawingService.strokes.push(modification);
            }
        }
        this.changeUndoAvailability();
        this.changeRedoAvailability();
        if(this.gameService.drawingPlayer == localStorage.getItem('username')){
            const event: DrawingEvent = {
                event: {},
                eventType: drawingEventType.REDO,
                gameId: this.gameService.gameId
            }
            this.socketService.emit('drawingEvent', event);        
        }
    }

    changeUndoAvailability(): void {
        if (this.drawingService.strokeStack.length) {
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

    drawElement(element: Stroke): void {
        this.pencilService.redrawStack(this.drawingService.baseCtx, element as Stroke);
    }
}
