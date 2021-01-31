import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Tool } from '@app/classes/tool';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { ExportComponent } from '@app/components/export/export.component';
import { SavingComponent } from '@app/components/saving/saving.component';
import { SidebarElements, SIDEBAR_ELEMENTS } from '@app/ressources/global-variables/sidebar-elements';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { NewDrawingService } from '@app/services/new-drawing/new-drawing.service';
import { BrushService } from '@app/services/tools/brush.service';
import { CircleService } from '@app/services/tools/circle.service';
import { EraserService } from '@app/services/tools/eraser.service';
import { FillService } from '@app/services/tools/fill.service';
import { LineService } from '@app/services/tools/line.service';
import { PenService } from '@app/services/tools/pen.service';
import { PencilService } from '@app/services/tools/pencil.service';
import { PipetteService } from '@app/services/tools/pipette.service';
import { PolygoneService } from '@app/services/tools/polygone.service';
import { CircleSelectionService } from '@app/services/tools/selection-services/circle-selection.service';
import { MagicWandService } from '@app/services/tools/selection-services/magic-wand.service';
import { SquareSelectionService } from '@app/services/tools/selection-services/square-selection.service';
import { SprayService } from '@app/services/tools/spray.service';
import { SquareService } from '@app/services/tools/square.service';
import { StampService } from '@app/services/tools/stamp.service';
import { TextService } from '@app/services/tools/text.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { takeUntil } from 'rxjs/operators';
@Injectable({
    providedIn: 'root',
})
export class ToolSelectionService {
    destroy$: Subject<boolean> = new Subject<boolean>();
    sidebarElements: SidebarElements = SIDEBAR_ELEMENTS;
    private tools: Map<string, Tool>;
    currentTool: Tool;
    currentToolName: Subject<string> = new Subject<string>();

    constructor(
        public dialog: MatDialog,
        public hotkeyService: HotkeyService,
        public pencilService: PencilService,
        public penService: PenService,
        public brushService: BrushService,
        public sprayService: SprayService,
        public squareService: SquareService,
        public circleService: CircleService,
        public lineService: LineService,
        public fillService: FillService,
        public eraserService: EraserService,
        public squareSelectionService: SquareSelectionService,
        public circleSelectionService: CircleSelectionService,
        public polygoneService: PolygoneService,
        public pipetteService: PipetteService,
        public drawingService: DrawingService,
        public newDrawingService: NewDrawingService,
        public magicWandService: MagicWandService,
        public undoRedoService: UndoRedoService,
        public textService: TextService,
        public stampService: StampService,
    ) {
        this.tools = new Map<string, Tool>([
            [TOOL_NAMES.PENCIL_TOOL_NAME, pencilService],
            [TOOL_NAMES.PEN_TOOL_NAME, penService],
            [TOOL_NAMES.BRUSH_TOOL_NAME, brushService],
            [TOOL_NAMES.SPRAY_TOOL_NAME, sprayService],
            [TOOL_NAMES.SQUARE_TOOL_NAME, squareService],
            [TOOL_NAMES.CIRCLE_TOOL_NAME, circleService],
            [TOOL_NAMES.LINE_TOOL_NAME, lineService],
            [TOOL_NAMES.FILL_TOOL_NAME, fillService],
            [TOOL_NAMES.ERASER_TOOL_NAME, eraserService],
            [TOOL_NAMES.SQUARE_SELECTION_TOOL_NAME, squareSelectionService],
            [TOOL_NAMES.CIRCLE_SELECTION_TOOL_NAME, circleSelectionService],
            [TOOL_NAMES.PIPETTE_TOOL_NAME, pipetteService],
            [TOOL_NAMES.POLYGONE_TOOL_NAME, polygoneService],
            [TOOL_NAMES.TEXT_TOOL_NAME, textService],
            [TOOL_NAMES.STAMP_TOOL_NAME, stampService],
            [TOOL_NAMES.MAGIC_WAND_TOOL_NAME, magicWandService],
        ]);
        this.currentTool = pencilService;
        this.hotkeyService
            .getKey()
            .pipe(takeUntil(this.destroy$))
            .subscribe((tool) => {
                if (this.tools.has(tool)) {
                    this.changeTool(tool);
                } else {
                    this.selectItem(tool);
                }
            });
    }

    changeTool(toolName: string): void {
        const selectedTool = this.tools.get(toolName);
        if (selectedTool) {
            this.currentTool.reset();
            this.currentTool = selectedTool;
            this.currentTool.initialize();
            this.currentTool.setCursor();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.currentToolName.next(toolName);
        }
    }

    selectItem(toolName: string): void {
        switch (toolName) {
            case this.sidebarElements.NEW_DRAWING_NAME:
                this.newDrawingService.openWarningModal();
                break;
            case this.sidebarElements.CAROUSEL_NAME:
                this.dialog.open(CarouselComponent);
                break;
            case this.sidebarElements.SAVE_SERVER_NAME:
                this.dialog.open(SavingComponent);
                break;
            case this.sidebarElements.EXPORT_DRAWING_NAME:
                this.dialog.open(ExportComponent);
                break;
            case this.sidebarElements.SELECT_ALL:
                this.selectAll();
                break;
            case this.sidebarElements.UNDO:
                this.undo();
                break;
            case this.sidebarElements.REDO:
                this.redo();
                break;
        }
    }

    undo(): void {
        this.undoRedoService.undo();
    }

    redo(): void {
        this.undoRedoService.redo();
    }

    selectAll(): void {
        this.changeTool(TOOL_NAMES.SQUARE_SELECTION_TOOL_NAME);
        this.squareSelectionService.selectAll();
    }

    getCurrentToolName(): string {
        return this.currentTool.name;
    }

    setCurrentToolCursor(): void {
        this.currentTool.setCursor();
    }

    currentToolKeyUp(event: KeyboardEvent): void {
        this.currentTool.onKeyUp(event);
    }

    currentToolKeyDown(event: KeyboardEvent): void {
        this.currentTool.onKeyDown(event);
    }

    currentToolMouseMove(event: MouseEvent): void {
        this.currentTool.onMouseMove(event);
    }

    currentToolMouseDown(event: MouseEvent): void {
        this.currentTool.onMouseDown(event);
    }

    currentToolMouseUp(event: MouseEvent): void {
        this.currentTool.onMouseUp(event);
    }

    currentToolMouseLeave(): void {
        this.currentTool.onMouseLeave();
    }

    currentToolMouseEnter(event: MouseEvent): void {
        this.currentTool.onMouseEnter(event);
    }

    currentToolWheelEvent(event: WheelEvent): void {
        this.currentTool.onWheelEvent(event);
    }

    getCurrentTool(): Observable<string> {
        return this.currentToolName.asObservable();
    }
}
