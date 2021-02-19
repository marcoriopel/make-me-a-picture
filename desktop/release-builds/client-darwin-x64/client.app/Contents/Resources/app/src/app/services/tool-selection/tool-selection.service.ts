import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Tool } from '@app/classes/tool';
import { SidebarElements, SIDEBAR_ELEMENTS } from '@app/ressources/global-variables/sidebar-elements';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { EraserService } from '@app/services/tools/eraser.service';
import { PencilService } from '@app/services/tools/pencil.service';
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
        public eraserService: EraserService,
        public undoRedoService: UndoRedoService,
        public drawingService: DrawingService,
    ) {
        this.tools = new Map<string, Tool>([
            [TOOL_NAMES.PENCIL_TOOL_NAME, pencilService],
            [TOOL_NAMES.ERASER_TOOL_NAME, eraserService],
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

    getCurrentTool(): Observable<string> {
        return this.currentToolName.asObservable();
    }
}
