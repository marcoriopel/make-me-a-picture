import { Component, OnDestroy, OnInit } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { ResizeDrawingService } from '@app/services/resize-drawing/resize-drawing.service';

@Component({
    selector: 'app-new-drawing-modal',
    templateUrl: './new-drawing-modal.component.html',
    styleUrls: ['./new-drawing-modal.component.scss'],
})
export class NewDrawingModalComponent implements OnInit, OnDestroy {
    constructor(public drawingService: DrawingService, public resizeDrawingService: ResizeDrawingService, public hotkeyService: HotkeyService) {}

    ngOnInit(): void {
        this.hotkeyService.isHotkeyEnabled = false;
    }
    createNewDrawing(): void {
        this.resizeDrawingService.setDefaultCanvasSize();
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.resetStack();
    }

    ngOnDestroy(): void {
        this.hotkeyService.isHotkeyEnabled = true;
    }
}
