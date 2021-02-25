import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import {
    MINIMUM_CANVAS_HEIGHT,
    MINIMUM_CANVAS_WIDTH,
    MINIMUM_WORKSPACE_HEIGHT,
    MINIMUM_WORKSPACE_WIDTH,
} from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements AfterViewInit {
    @ViewChild('drawingComponent', { static: false }) drawingComponent: DrawingComponent;
    @ViewChild('workSpace', { static: false }) workSpaceRef: ElementRef<HTMLDivElement>;
    @ViewChild('previewDiv', { static: false }) previewDivRef: ElementRef<HTMLDivElement>;
    @ViewChild('pencil', { static: false }) pencilRef: ElementRef<HTMLButtonElement>;
    @ViewChild('eraser', { static: false }) eraserRef: ElementRef<HTMLButtonElement>;

    lineWidthMin: number = 1;
    lineWidthMax: number = 100;
    lineWidthStep: number = 1;
    lineWidth: number = 10;

    workSpaceSize: Vec2 = { x: MINIMUM_WORKSPACE_WIDTH, y: MINIMUM_WORKSPACE_HEIGHT };
    previewSize: Vec2 = { x: MINIMUM_CANVAS_WIDTH, y: MINIMUM_CANVAS_HEIGHT };
    canvasSize: Vec2 = { x: MINIMUM_CANVAS_WIDTH, y: MINIMUM_CANVAS_HEIGHT };
    previewDiv: HTMLDivElement;

    shortcutsArray: string[] = ['c', 'e', 'z', 'Z', 'g'];

    pencilColor: string = '#000000';
    previousColors: string[] = [
        "#EB5757",
        "#F2994A",
        "#F2C94C",
        "#219653",
        "#27AE60",
        "#2F80ED",
        "#2D9CDB",
        "#56CCF2",
        "#9B51E0",
        "#BB6BD9",
        "#231F20",
    ]

    constructor(
        public hotkeyService: HotkeyService,
        public drawingService: DrawingService,
        public undoRedoService: UndoRedoService,
    ) {
        this.drawingService.color = "#000000";
        this.drawingService.lineWidth = this.lineWidth;
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            const workspaceElement: HTMLElement = this.workSpaceRef.nativeElement;
            this.pencilRef.nativeElement.style.backgroundColor = '#BA2034'
            this.drawingService.gridCanvas.style.cursor = 'crosshair';
            this.workSpaceSize.x = workspaceElement.offsetWidth;
            this.workSpaceSize.y = workspaceElement.offsetHeight;
            this.previewDiv = this.previewDivRef.nativeElement;
            this.previewDiv.style.display = 'none';
            this.previewDiv.style.borderWidth = '1px';
            this.previewDiv.style.borderColor = '#09acd9';
            this.previewDiv.style.borderStyle = 'dashed';
            this.previewDiv.style.position = 'absolute';
        });
    }

    onMouseDown(event: MouseEvent): void {
        this.previewDiv.style.display = 'block';
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.previewDiv.style.display = 'none';
    }

    setColor(color: string){
        this.drawingService.color = color;
        this.previousColors.pop();
        this.previousColors.unshift(this.pencilColor);
        this.pencilColor = color;
    }

    setEraser(): void {
        this.pencilColor = this.drawingService.color;
        this.drawingService.color = "#FFFFFF"
        this.pencilRef.nativeElement.style.backgroundColor = '#FFFFFF'
        this.eraserRef.nativeElement.style.backgroundColor = '#BA2034'
    }

    setPencil(): void {
        this.drawingService.color = this.pencilColor;
        this.pencilRef.nativeElement.style.backgroundColor = '#BA2034'
        this.eraserRef.nativeElement.style.backgroundColor = '#FFFFFF'
    }

    changeLineWidth(): void {
        this.drawingService.lineWidth = this.lineWidth;
    }
}
