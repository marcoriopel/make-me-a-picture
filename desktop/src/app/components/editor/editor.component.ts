import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
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
    PURPLE,
    RED,
    TURQUOISE,
    YELLOW,
} from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GameService } from '@app/services/game/game.service';
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
    @ViewChild('pencil', { static: false }) pencilRef: ElementRef<HTMLButtonElement>;
    @ViewChild('eraser', { static: false }) eraserRef: ElementRef<HTMLButtonElement>;
    @Output() colorChange = new EventEmitter<any>();
    @Input() isInGame: boolean;

    lineWidthMin: number = MIN_LINE_WIDTH;
    lineWidthMax: number = MAX_LINE_WIDTH;
    lineWidthStep: number = LINE_WIDTH_STEP;
    lineWidth: number = INITIAL_LINE_WIDTH;
    pencilWidth: number = 10;
    eraserWidth: number = 10;

    opacityMin: number = 0;
    opacityMax: number = 100;
    opacityStep: number = 1;
    opacity: number = 100;

    workSpaceSize: Vec2 = { x: MINIMUM_WORKSPACE_WIDTH, y: MINIMUM_WORKSPACE_HEIGHT };
    previewSize: Vec2 = { x: MINIMUM_CANVAS_WIDTH, y: MINIMUM_CANVAS_HEIGHT };
    canvasSize: Vec2 = { x: MINIMUM_CANVAS_WIDTH, y: MINIMUM_CANVAS_HEIGHT };

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
        public gameService: GameService,
    ) {
        this.drawingService.color = BLACK;
        this.drawingService.lineWidth = this.lineWidth;
        this.drawingService.opacity = this.opacity / 100;
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            const workspaceElement: HTMLElement = this.workSpaceRef.nativeElement;
            this.workSpaceSize.x = workspaceElement.offsetWidth;
            this.workSpaceSize.y = workspaceElement.offsetHeight;
        });
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.hotkeyService.onKeyDown(event);
    }

    setColor(color: string){
        this.drawingService.color = color;
        this.pencilColor = color;
        this.colorChange.emit();
    }

    changeLineWidth(): void {
        this.drawingService.currentTool == 'pencil' ? this.drawingService.pencilWidth = this.drawingService.lineWidth : this.drawingService.eraserWidth = this.drawingService.lineWidth;
        this.drawingService.currentTool == 'pencil' ? this.drawingService.lineWidth = this.drawingService.pencilWidth : this.drawingService.lineWidth = this.drawingService.eraserWidth;
    }

    changeOpacity(): void {
        this.drawingService.opacity = this.opacity / 100;
    }
}
