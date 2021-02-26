import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import {
    BLACK,
    DARK,
    DARK_BLUE,
    DARK_GREEN,
    INITIAL_LINE_WIDTH,
    LIGHT_BLUE,
    LIGHT_GREEN,
    LINE_WIDTH_STEP,
    MAX_LINE_WIDTH,
    MINIMUM_CANVAS_HEIGHT,
    MINIMUM_CANVAS_WIDTH,
    MINIMUM_WORKSPACE_HEIGHT,
    MINIMUM_WORKSPACE_WIDTH,
    MIN_LINE_WIDTH,
    ORANGE,
    PINK,
    POLY_RED,
    PURPLE,
    RED,
    TURQUOISE,
    WHITE,
    YELLOW,
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

    lineWidthMin: number = MIN_LINE_WIDTH;
    lineWidthMax: number = MAX_LINE_WIDTH;
    lineWidthStep: number = LINE_WIDTH_STEP;
    lineWidth: number = INITIAL_LINE_WIDTH;

    workSpaceSize: Vec2 = { x: MINIMUM_WORKSPACE_WIDTH, y: MINIMUM_WORKSPACE_HEIGHT };
    previewSize: Vec2 = { x: MINIMUM_CANVAS_WIDTH, y: MINIMUM_CANVAS_HEIGHT };
    canvasSize: Vec2 = { x: MINIMUM_CANVAS_WIDTH, y: MINIMUM_CANVAS_HEIGHT };
    previewDiv: HTMLDivElement;

    shortcutsArray: string[] = ['c', 'z', 'Z', 'g'];

    pencilColor: string = BLACK;
    previousColors: string[] = [
        RED,
        ORANGE,
        YELLOW,
        DARK_GREEN,
        LIGHT_GREEN,
        DARK_BLUE,
        LIGHT_BLUE,
        TURQUOISE,
        PURPLE,
        PINK,
        DARK,
    ]

    constructor(
        public hotkeyService: HotkeyService,
        public drawingService: DrawingService,
        public undoRedoService: UndoRedoService,
    ) {
        this.drawingService.color = BLACK;
        this.drawingService.lineWidth = this.lineWidth;
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            const workspaceElement: HTMLElement = this.workSpaceRef.nativeElement;
            this.pencilRef.nativeElement.style.backgroundColor = POLY_RED;
            this.drawingService.gridCanvas.style.cursor = 'crosshair';
            this.workSpaceSize.x = workspaceElement.offsetWidth;
            this.workSpaceSize.y = workspaceElement.offsetHeight;
            this.previewDiv = this.previewDivRef.nativeElement;
            this.previewDiv.style.display = 'none';
            this.previewDiv.style.position = 'absolute';
        });
    }

    onMouseDown(event: MouseEvent): void {
        this.previewDiv.style.display = 'block';
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.hotkeyService.onKeyDown(event);
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
        this.pencilColor = color;
        this.setPencil();
    }

    setEraser(): void {
        this.pencilColor = this.drawingService.color;
        this.drawingService.color = WHITE;
        this.pencilRef.nativeElement.style.backgroundColor = WHITE;
        this.eraserRef.nativeElement.style.backgroundColor = POLY_RED;
    }

    setPencil(): void {
        this.drawingService.color = this.pencilColor;
        this.pencilRef.nativeElement.style.backgroundColor = POLY_RED;
        this.eraserRef.nativeElement.style.backgroundColor = WHITE;
    }

    changeLineWidth(): void {
        this.drawingService.lineWidth = this.lineWidth;
    }
}
