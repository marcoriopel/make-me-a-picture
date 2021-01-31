import { TestBed } from '@angular/core/testing';
import { Brush, Ellipse, Eraser, Fill, Line, Pencil, Polygone, Rectangle, Resize, Selection } from '@app/classes/tool-properties';
import { PATTERN_NAMES } from '@app/ressources/global-variables/brush-pattern-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeDrawingService } from '@app/services/resize-drawing/resize-drawing.service';
import { BrushService } from '@app/services/tools/brush.service';
import { CircleService } from '@app/services/tools/circle.service';
import { EraserService } from '@app/services/tools/eraser.service';
import { LineService } from '@app/services/tools/line.service';
import { PencilService } from '@app/services/tools/pencil.service';
import { PolygoneService } from '@app/services/tools/polygone.service';
import { SelectionService } from '@app/services/tools/selection-services/selection.service';
import { SquareService } from '@app/services/tools/square.service';
import { Subject } from 'rxjs';
import { UndoRedoService } from './undo-redo.service';
// tslint:disable: no-any
describe('UndoRedoService', () => {
    let service: UndoRedoService;
    let changeUndoAvailabilitySpy: jasmine.SpyObj<any>;
    let changeRedoAvailabilitySpy: jasmine.SpyObj<any>;
    let setUndoAvailabilitySpy: jasmine.SpyObj<any>;
    let setRedoAvailabilitySpy: jasmine.SpyObj<any>;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let pencilServiceSpy: jasmine.SpyObj<PencilService>;
    let resizeDrawingSpy: jasmine.SpyObj<ResizeDrawingService>;
    let selectionServiceSpy: jasmine.SpyObj<SelectionService>;
    let brushServiceSpy: jasmine.SpyObj<BrushService>;
    let eraserServiceSpy: jasmine.SpyObj<EraserService>;
    let lineServiceSpy: jasmine.SpyObj<LineService>;
    let squareServiceSpy: jasmine.SpyObj<SquareService>;
    let circleServiceSpy: jasmine.SpyObj<CircleService>;
    let polygoneServiceSpy: jasmine.SpyObj<PolygoneService>;

    let obs: Subject<boolean>;

    let drawingService: DrawingService;
    let resizeDrawingService: ResizeDrawingService;

    let pencilData: Pencil;
    let brushData: Brush;
    let eraserData: Eraser;
    let rectangleData: Rectangle;
    let ellipseData: Ellipse;
    let lineData: Line;
    let polygoneData: Polygone;
    let resizeData: Resize;
    let fillData: Fill;
    let selectionData: Selection;

    beforeEach(() => {
        obs = new Subject<boolean>();
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', [
            'clearCanvas',
            'getIsToolInUse',
            'drawFill',
            'restoreSelection',
            'setIsToolInUse',
            'autoSave',
        ]);
        drawingServiceSpy.getIsToolInUse.and.returnValue(obs.asObservable());
        resizeDrawingSpy = jasmine.createSpyObj('ResizeDrawingService', ['resizeCanvasSize', 'restoreCanvas']);
        pencilServiceSpy = jasmine.createSpyObj('PencilService', ['drawPencilStroke']);
        selectionServiceSpy = jasmine.createSpyObj('SelectionService', ['reset', 'applyPreview', 'updateSelectionData']);
        brushServiceSpy = jasmine.createSpyObj('BrushService', ['drawLine']);
        eraserServiceSpy = jasmine.createSpyObj('EraserService', ['drawEraserStroke']);
        lineServiceSpy = jasmine.createSpyObj('LineService', ['drawFullLine']);
        squareServiceSpy = jasmine.createSpyObj('SquareService', ['drawRectangle']);
        circleServiceSpy = jasmine.createSpyObj('CircleService', ['drawEllipse']);
        polygoneServiceSpy = jasmine.createSpyObj('PolygoneService', ['drawPolygone']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: ResizeDrawingService, useValue: resizeDrawingSpy },
                { provide: SelectionService, useValue: selectionServiceSpy },
                { provide: PencilService, useValue: pencilServiceSpy },
                { provide: BrushService, useValue: brushServiceSpy },
                { provide: EraserService, useValue: eraserServiceSpy },
                { provide: LineService, useValue: lineServiceSpy },
                { provide: SquareService, useValue: squareServiceSpy },
                { provide: CircleService, useValue: circleServiceSpy },
                { provide: PolygoneService, useValue: polygoneServiceSpy },
            ],
        });
        service = TestBed.inject(UndoRedoService);

        resizeDrawingService = TestBed.inject(ResizeDrawingService);
        resizeDrawingService.workSpaceSize = { x: 1, y: 1 };

        drawingService = TestBed.inject(DrawingService);
        drawingService.undoStack = [];
        drawingService.redoStack = [];

        setUndoAvailabilitySpy = spyOn<any>(service, 'setUndoAvailability').and.callThrough();
        setRedoAvailabilitySpy = spyOn<any>(service, 'setRedoAvailability').and.callThrough();

        pencilData = {
            type: 'pencil',
            path: [{ x: 0, y: 0 }],
            lineWidth: 1,
            primaryColor: '#000000',
        };

        brushData = {
            type: 'brush',
            path: [{ x: 0, y: 0 }],
            lineWidth: 1,
            primaryColor: '#000000',
            lineCap: 'round',
            pattern: PATTERN_NAMES.FIFTH_PATTERN,
        };

        eraserData = {
            type: 'eraser',
            path: [{ x: 0, y: 0 }],
            lineWidth: 1,
            fillStyle: '0',
            primaryColor: '#000000',
            lineCap: 'round',
        };

        rectangleData = {
            type: 'rectangle',
            primaryColor: '#000000',
            secondaryColor: '#000000',
            width: 1,
            height: 1,
            topLeftPoint: { x: 0, y: 0 },
            fillStyle: 0,
            isShiftDown: false,
            lineWidth: 1,
        };

        ellipseData = {
            type: 'ellipse',
            primaryColor: '#000000',
            secondaryColor: '#000000',
            center: { x: 1, y: 1 },
            radius: { x: 1, y: 1 },
            firstPoint: { x: 1, y: 1 },
            lastPoint: { x: 1, y: 1 },
            fillStyle: 0,
            isShiftDown: false,
            lineWidth: 1,
        };

        lineData = {
            type: 'line',
            primaryColor: '#000000',
            secondaryColor: '#000000',
            mouseClicks: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
            ],
            isDot: false,
            lineCap: 'round',
            lineWidth: 1,
            line: { startingPoint: { x: 0, y: 0 }, endingPoint: { x: 1, y: 1 } },
            storedLines: [{ startingPoint: { x: 0, y: 0 }, endingPoint: { x: 1, y: 1 } }],
            isShiftDoubleClick: false,
            hasLastPointBeenChaged: false,
            dotWidth: 1,
        };

        polygoneData = {
            type: 'polygone',
            primaryColor: '#000000',
            secondaryColor: '#000000',
            fillStyle: 0,
            lineWidth: 1,
            circleHeight: 1,
            circleWidth: 1,
            firstPoint: { x: 0, y: 0 },
            lastPoint: { x: 1, y: 1 },
            sides: 3,
        };

        resizeData = {
            type: 'resize',
            canvasSize: { x: 10, y: 10 },
            imageData: (undefined as unknown) as ImageData,
        };

        fillData = {
            type: 'fill',
            imageData: (undefined as unknown) as ImageData,
        };

        selectionData = {
            type: 'selection',
            imageData: (undefined as unknown) as ImageData,
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should reset undo and redo stack (empty)', () => {
        drawingService.undoStack = [];
        drawingService.redoStack = [];
        drawingService.redoStack.push(pencilData);
        drawingService.undoStack.push(pencilData);
    });

    it('should not return if tool is not in use when calling undo', () => {
        changeRedoAvailabilitySpy = spyOn<any>(service, 'changeRedoAvailability');
        changeUndoAvailabilitySpy = spyOn<any>(service, 'changeUndoAvailability');
        obs.next(false);
        drawingService.undoStack = [];
        drawingService.undoStack.push(pencilData);
        drawingService.undoStack.push(pencilData);
        service.undo();
        expect(selectionServiceSpy.reset).toHaveBeenCalled();
        expect(resizeDrawingSpy.resizeCanvasSize).toHaveBeenCalled();
        expect(changeUndoAvailabilitySpy).toHaveBeenCalled();
        expect(changeRedoAvailabilitySpy).toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should not call resizeCanvasSize if tool is in use (should not complete undo operation because unavailable)', () => {
        obs.next(true);
        service.undo();
        expect(resizeDrawingSpy.resizeCanvasSize).not.toHaveBeenCalled();
    });

    it('if there is already a modification it should be pushed to redo stack when calling undo', () => {
        drawingService.undoStack = [];
        drawingService.undoStack.push(pencilData);
        drawingService.undoStack.push(pencilData);
        obs.next(false);
        service.undo();
        expect(drawingService.redoStack.length).toEqual(1);
    });

    it('if there is no modification on canvas nothing should be pushed to redo stack when calling undo', () => {
        drawingService.undoStack = [];
        obs.next(false);
        service.undo();
        expect(drawingService.redoStack.length).toEqual(0);
    });

    it('if there is an element in undo stack, drawElement should be called when calling undo', () => {
        drawingService.undoStack = [];
        drawingService.redoStack = [];
        drawingService.undoStack.push(pencilData);
        drawingService.undoStack.push(pencilData); // Pushing 2 modifications because one is popped
        obs.next(false);
        service.undo();
        expect(drawingService.redoStack.length).toEqual(1);
    });

    it('should not call drawElement if tool is in use (should not complete redo operation because unavailable', () => {
        const drawElementSpy: jasmine.SpyObj<any> = spyOn<any>(service, 'drawElement');
        obs.next(true);
        drawingService.redoStack = [];
        service.redo();
        expect(drawElementSpy).not.toHaveBeenCalled();
    });

    it('if there is an element in redo stack, it should be added to undo stack when calling redo', () => {
        obs.next(false);
        drawingService.redoStack = [];
        drawingService.undoStack = [];
        drawingService.redoStack.push(pencilData);
        service.redo();
        expect(drawingService.undoStack.length).toEqual(1);
    });

    it('if there is no element in redo stack, drawElement should not be called when redo is called', () => {
        const drawElementSpy: jasmine.SpyObj<any> = spyOn<any>(service, 'drawElement');
        changeRedoAvailabilitySpy = spyOn<any>(service, 'changeRedoAvailability');
        changeUndoAvailabilitySpy = spyOn<any>(service, 'changeUndoAvailability');
        obs.next(false);
        drawingService.redoStack = [];
        service.redo();
        expect(drawElementSpy).not.toHaveBeenCalled();
    });

    it('changeUndoAvailability should call setUndoAvailability with true if there is elements in undoStack', () => {
        drawingService.undoStack = [];
        drawingService.undoStack.push(pencilData);
        service.changeUndoAvailability();
        expect(setUndoAvailabilitySpy).toHaveBeenCalledWith(true);
    });

    it('changeUndoAvailability should call setUndoAvailability with false if there is no elements in undoStack', () => {
        drawingService.undoStack = [];
        service.changeUndoAvailability();
        expect(setUndoAvailabilitySpy).toHaveBeenCalledWith(false);
    });

    it('changeRedoAvailability should call setRedoAvailability with true if there is elements in redoStack', () => {
        drawingService.redoStack = [];
        drawingService.redoStack.push(pencilData);
        service.changeRedoAvailability();
        expect(setRedoAvailabilitySpy).toHaveBeenCalledWith(true);
    });

    it('changeRedoAvailability should call setRedoAvailability with false if there is no elements in redoStack', () => {
        drawingService.redoStack = [];
        service.changeRedoAvailability();
        expect(setRedoAvailabilitySpy).toHaveBeenCalledWith(false);
    });

    it('drawElement should call drawPencilStroke if the modification in the stack is of type pencil', () => {
        service.drawElement(pencilData);
        expect(pencilServiceSpy.drawPencilStroke).toHaveBeenCalled();
    });

    it('drawElement should call drawLine if the modification in the stack is of type brush', () => {
        service.drawElement(brushData);
        expect(brushServiceSpy.drawLine).toHaveBeenCalled();
    });

    it('drawElement should call drawEraserStroke if the modification in the stack is of type eraser', () => {
        service.drawElement(eraserData);
        expect(eraserServiceSpy.drawEraserStroke).toHaveBeenCalled();
    });

    it('drawElement should call drawFullLine if the modification in the stack is of type line', () => {
        service.drawElement(lineData);
        expect(lineServiceSpy.drawFullLine).toHaveBeenCalled();
    });

    it('drawElement should call drawRectangle if the modification in the stack is of type rectangle', () => {
        service.drawElement(rectangleData);
        expect(squareServiceSpy.drawRectangle).toHaveBeenCalled();
    });

    it('drawElement should call drawEllipse if the modification in the stack is of type ellipse', () => {
        service.drawElement(ellipseData);
        expect(circleServiceSpy.drawEllipse).toHaveBeenCalled();
    });

    it('drawElement should call drawFill if the modification in the stack is of type fill', () => {
        service.drawElement(fillData);
        expect(drawingService.drawFill).toHaveBeenCalled();
    });

    it('drawElement should call restoreCanvas if the modification in the stack is of type resize', () => {
        service.drawElement(resizeData);
        expect(resizeDrawingSpy.restoreCanvas).toHaveBeenCalled();
    });

    it('drawElement should call drawPolygone if the modification in the stack is of type polygone', () => {
        service.drawElement(polygoneData);
        expect(polygoneServiceSpy.drawPolygone).toHaveBeenCalled();
    });

    it('drawElement should call restoreSelection if the modification in the stack is of type selection', () => {
        service.drawElement(selectionData);
        expect(drawingService.restoreSelection).toHaveBeenCalled();
    });

    it('getUndoAvailability should return true if undo is available (called async)', () => {
        let returnValue = false;
        service.getUndoAvailability().subscribe((value: boolean) => {
            returnValue = value;
        });
        service.setUndoAvailability(true);
        expect(returnValue).toBe(true);
    });

    it('getUndoAvailability should return false if undo is unavailable (called async)', () => {
        let returnValue = true;
        service.getUndoAvailability().subscribe((value: boolean) => {
            returnValue = value;
        });
        service.setUndoAvailability(false);
        expect(returnValue).toBe(false);
    });

    it('getRedoAvailability should return true if redo is available (called async)', () => {
        let returnValue = false;
        service.getRedoAvailability().subscribe((value: boolean) => {
            returnValue = value;
        });
        service.setRedoAvailability(true);
        expect(returnValue).toBe(true);
    });

    it('getRedoAvailability should return false if redo is unavailable (called async)', () => {
        let returnValue = true;
        service.getRedoAvailability().subscribe((value: boolean) => {
            returnValue = value;
        });
        service.setRedoAvailability(false);
        expect(returnValue).toBe(false);
    });
    // tslint:disable-next-line: max-file-line-count
});
