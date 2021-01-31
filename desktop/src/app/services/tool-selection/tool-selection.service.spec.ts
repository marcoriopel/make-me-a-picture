import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Tool } from '@app/classes/tool';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { ExportComponent } from '@app/components/export/export.component';
import { SavingComponent } from '@app/components/saving/saving.component';
import { SIDEBAR_ELEMENTS } from '@app/ressources/global-variables/sidebar-elements';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { NewDrawingService } from '@app/services/new-drawing/new-drawing.service';
import { ToolSelectionService } from '@app/services/tool-selection/tool-selection.service';
import { BrushService } from '@app/services/tools/brush.service';
import { CircleService } from '@app/services/tools/circle.service';
import { EraserService } from '@app/services/tools/eraser.service';
import { FillService } from '@app/services/tools/fill.service';
import { LineService } from '@app/services/tools/line.service';
import { PencilService } from '@app/services/tools/pencil.service';
import { PipetteService } from '@app/services/tools/pipette.service';
import { PolygoneService } from '@app/services/tools/polygone.service';
import { CircleSelectionService } from '@app/services/tools/selection-services/circle-selection.service';
import { SquareSelectionService } from '@app/services/tools/selection-services/square-selection.service';
import { SquareService } from '@app/services/tools/square.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subject } from 'rxjs';

import SpyObj = jasmine.SpyObj;
// tslint:disable: no-empty

class MockTool extends Tool {
    constructor(name: string) {
        super({} as DrawingService);
        this.name = name;
    }
    initialize(): void {}
    reset(): void {}
    setCursor(): void {}
}

describe('ToolSelectionService', () => {
    let service: ToolSelectionService;
    let hotkeyServiceSpy: SpyObj<HotkeyService>;
    let undoRedoServiceSpy: SpyObj<UndoRedoService>;
    let matdialogSpy: SpyObj<MatDialog>;
    let newDrawingServiceSpy: SpyObj<NewDrawingService>;
    let drawingServiceSpy: SpyObj<DrawingService>;
    let squareSelectionServiceSpy: SpyObj<SquareSelectionService>;
    let obs: Subject<string>;
    let keyboardEvent: KeyboardEvent;
    let eraserServiceMock: MockTool;
    beforeEach(() => {
        obs = new Subject<string>();
        squareSelectionServiceSpy = jasmine.createSpyObj('SquareSelectionService', ['reset', 'initialize', 'setCursor', 'selectAll']);
        matdialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        newDrawingServiceSpy = jasmine.createSpyObj('NewDrawingService', ['openWarningModal']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['openWarning', 'clearCanvas', 'getIsToolInUse']);
        hotkeyServiceSpy = jasmine.createSpyObj('HotkeyService', ['getKey']);
        undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['undo', 'redo']);
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        eraserServiceMock = new MockTool(TOOL_NAMES.ERASER_TOOL_NAME);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: HotkeyService, useValue: hotkeyServiceSpy },
                { provide: MatDialog, useValue: matdialogSpy },
                { provide: NewDrawingService, useValue: newDrawingServiceSpy },
                { provide: PencilService, useValue: new MockTool(TOOL_NAMES.PENCIL_TOOL_NAME) },
                { provide: EraserService, useValue: eraserServiceMock },
                { provide: BrushService, useValue: new MockTool(TOOL_NAMES.BRUSH_TOOL_NAME) },
                { provide: SquareService, useValue: new MockTool(TOOL_NAMES.SQUARE_TOOL_NAME) },
                { provide: CircleService, useValue: new MockTool(TOOL_NAMES.CIRCLE_TOOL_NAME) },
                { provide: LineService, useValue: new MockTool(TOOL_NAMES.LINE_TOOL_NAME) },
                { provide: FillService, useValue: new MockTool(TOOL_NAMES.FILL_TOOL_NAME) },
                { provide: SquareSelectionService, useValue: squareSelectionServiceSpy },
                { provide: CircleSelectionService, useValue: new MockTool(TOOL_NAMES.CIRCLE_SELECTION_TOOL_NAME) },
                { provide: PolygoneService, useValue: new MockTool(TOOL_NAMES.POLYGONE_TOOL_NAME) },
                { provide: PipetteService, useValue: new MockTool(TOOL_NAMES.PIPETTE_TOOL_NAME) },
                { provide: UndoRedoService, useValue: undoRedoServiceSpy },
            ],
        });
        service = TestBed.inject(ToolSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change tool', () => {
        service.changeTool(TOOL_NAMES.ERASER_TOOL_NAME);
        expect(service.currentTool.name).toBe(TOOL_NAMES.ERASER_TOOL_NAME);
    });

    it('should clear canvas when tool change', () => {
        const currentToolResetSpy = spyOn(service.currentTool, 'reset');
        const currentToolInitializeSpy = spyOn(eraserServiceMock, 'initialize');
        const currentToolSetCursorSpy = spyOn(eraserServiceMock, 'setCursor');

        service.changeTool(TOOL_NAMES.ERASER_TOOL_NAME);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(currentToolResetSpy).toHaveBeenCalled();
        expect(currentToolInitializeSpy).toHaveBeenCalled();
        expect(currentToolSetCursorSpy).toHaveBeenCalled();
    });

    it('should get current tool', () => {
        expect(service.getCurrentToolName()).toBe(service.currentTool.name);
    });

    it('should not change current tool if changeTool is called with an invalid tool name', () => {
        service.changeTool('invalid tool name');
        expect(service.currentTool.name).toBe(TOOL_NAMES.PENCIL_TOOL_NAME);
    });

    it('should change current tool if changeTool is called with a valid tool name', () => {
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next(TOOL_NAMES.ERASER_TOOL_NAME);
        expect(service.currentTool.name).toBe(TOOL_NAMES.ERASER_TOOL_NAME);
    });

    it('should call openWarning of newdrawing on newDrawing call', () => {
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next(SIDEBAR_ELEMENTS.NEW_DRAWING_NAME);
        expect(newDrawingServiceSpy.openWarningModal).toHaveBeenCalled();
    });

    it('should open carousel component on call', () => {
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next(SIDEBAR_ELEMENTS.CAROUSEL_NAME);
        expect(matdialogSpy.open).toHaveBeenCalledWith(CarouselComponent);
    });

    it('should open save component on call', () => {
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next(SIDEBAR_ELEMENTS.SAVE_SERVER_NAME);
        expect(matdialogSpy.open).toHaveBeenCalledWith(SavingComponent);
    });

    it('should open save component on call', () => {
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next(SIDEBAR_ELEMENTS.EXPORT_DRAWING_NAME);
        expect(matdialogSpy.open).toHaveBeenCalledWith(ExportComponent);
    });

    it('should call select all of selection service on square call', () => {
        const selectAllSpy = spyOn(service, 'selectAll');
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next(SIDEBAR_ELEMENTS.SELECT_ALL);
        expect(selectAllSpy).toHaveBeenCalled();
    });

    it('should call undo on call', () => {
        const undoSpy = spyOn(service, 'undo');
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next(SIDEBAR_ELEMENTS.UNDO);
        expect(undoSpy).toHaveBeenCalled();
    });

    it('should call redo on call', () => {
        const redoSpy = spyOn(service, 'redo');
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next(SIDEBAR_ELEMENTS.REDO);
        expect(redoSpy).toHaveBeenCalled();
    });

    it('should call undo of undo service on call', () => {
        service.undo();
        expect(undoRedoServiceSpy.undo).toHaveBeenCalled();
    });

    it('should call redo of redo service on call', () => {
        service.redo();
        expect(undoRedoServiceSpy.redo).toHaveBeenCalled();
    });

    it('selectAll should call the selectAll of square selection', () => {
        service.selectAll();
        expect(squareSelectionServiceSpy.selectAll).toHaveBeenCalled();
    });

    it('should call current tool keyup on keyup event', () => {
        keyboardEvent = new KeyboardEvent('keyup', { key: 'w' });
        const keyUpSpy = spyOn(service.currentTool, 'onKeyUp');
        service.currentToolKeyUp(keyboardEvent);
        expect(keyUpSpy).toHaveBeenCalledWith(keyboardEvent);
    });

    it('should call current tool keydown on keydown event', () => {
        keyboardEvent = new KeyboardEvent('keydown', { key: 'w' });
        const keyDownSpy = spyOn(service.currentTool, 'onKeyDown');
        service.currentToolKeyDown(keyboardEvent);
        expect(keyDownSpy).toHaveBeenCalledWith(keyboardEvent);
    });

    it('should call current tool mousemove on mousemove event', () => {
        const event = {} as MouseEvent;
        const mouseMoveSpy = spyOn(service.currentTool, 'onMouseMove');
        service.currentToolMouseMove(event);
        expect(mouseMoveSpy).toHaveBeenCalledWith(event);
    });

    it('should call current tool mousedown on mousedown event', () => {
        const event = {} as MouseEvent;
        const mouseDownSpy = spyOn(service.currentTool, 'onMouseDown');
        service.currentToolMouseDown(event);
        expect(mouseDownSpy).toHaveBeenCalledWith(event);
    });

    it('should call current tool mouseup on mouseup event', () => {
        const event = {} as MouseEvent;
        const mouseUpSpy = spyOn(service.currentTool, 'onMouseUp');
        service.currentToolMouseUp(event);
        expect(mouseUpSpy).toHaveBeenCalledWith(event);
    });

    it('should call current tool onMouseLeave on onMouseLeave event', () => {
        const mouseLeaveSpy = spyOn(service.currentTool, 'onMouseLeave');
        service.currentToolMouseLeave();
        expect(mouseLeaveSpy).toHaveBeenCalled();
    });

    it('should call current tool onMouseEnter on onMouseEnter event', () => {
        const mouseEnterSpy = spyOn(service.currentTool, 'onMouseEnter');
        service.currentToolMouseEnter({} as MouseEvent);
        expect(mouseEnterSpy).toHaveBeenCalled();
    });

    it('should call setCursor on call', () => {
        const cursorSpy = spyOn(service.currentTool, 'setCursor');
        service.setCurrentToolCursor();
        expect(cursorSpy).toHaveBeenCalled();
    });

    it('should call current tool onWheelEvent on WheelEvent', () => {
        const wheelEvent = new WheelEvent('wheel');
        const wheelSpy = spyOn(service.currentTool, 'onWheelEvent');
        service.currentToolWheelEvent(wheelEvent);
        expect(wheelSpy).toHaveBeenCalledWith(wheelEvent);
    });
});
