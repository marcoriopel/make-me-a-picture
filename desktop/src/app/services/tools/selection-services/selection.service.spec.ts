import { TestBed } from '@angular/core/testing';
import { SelectionBox } from '@app/classes/selection-box';
import { FILL_STYLES } from '@app/ressources/global-variables/fill-styles';
import { DASH_LENGTH, DASH_SPACE_LENGTH, MouseButton } from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SquareService } from '@app/services/tools/square.service';
import { MoveService } from '@app/services/tools/transformation-services/move.service';
import { RotateService } from '@app/services/tools/transformation-services/rotate.service';
import { MagnetismService } from './magnetism.service';
import { SelectionService } from './selection.service';
import SpyObj = jasmine.SpyObj;

// tslint:disable: no-string-literal
// tslint:disable: max-file-line-count
// tslint:disable: no-magic-numbers
// tslint:disable: no-any

describe('SelectionService', () => {
    let service: SelectionService;
    let drawingServiceSpy: SpyObj<DrawingService>;
    let moveServiceSpy: SpyObj<MoveService>;
    let magnetismServiceSpy: SpyObj<MagnetismService>;
    let previewCtxSpy: SpyObj<CanvasRenderingContext2D>;
    let baseCtxSpy: SpyObj<CanvasRenderingContext2D>;
    let underlyingServiceSpy: SpyObj<SquareService>;
    let rotateServiceSpy: SpyObj<RotateService>;

    beforeEach(() => {
        magnetismServiceSpy = jasmine.createSpyObj('MagnetismService', [
            'magnetismXAxisChange',
            'magnetismYAxisChange',
            'onMouseMoveMagnetism',
            'magnetismCoordinateReference',
        ]);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', [
            'clearCanvas',
            'getCanvasData',
            'updateStack',
            'setIsToolInUse',
            'applyPreview',
            'autoSave',
        ]);
        moveServiceSpy = jasmine.createSpyObj('MoveService', [
            'printSelectionOnPreview',
            'onMouseDown',
            'onMouseMove',
            'onKeyDown',
            'onKeyUp',
            'snapOnGrid',
        ]);
        underlyingServiceSpy = jasmine.createSpyObj('SquareService', ['onMouseDown', 'drawShape', 'onMouseMove', 'onKeyDown', 'onKeyUp']);
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['setLineDash', 'fillRect', 'save', 'restore']);
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['drawImage']);
        rotateServiceSpy = jasmine.createSpyObj('RotateService', ['restoreSelection', 'onKeyDown', 'onKeyUp', 'rotatePreviewCanvas', 'onMouseWheel']);
        drawingServiceSpy.previewCtx = previewCtxSpy;
        drawingServiceSpy.baseCtx = baseCtxSpy;

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: MoveService, useValue: moveServiceSpy },
                { provide: RotateService, useValue: rotateServiceSpy },
                { provide: MagnetismService, useValue: magnetismServiceSpy },
            ],
        });
        service = TestBed.inject(SelectionService);

        service.underlyingService = underlyingServiceSpy;
        service.selection.height = 0;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('initialize should set drawingService.previewCtx properties', () => {
        service.initialize();
        expect(previewCtxSpy.lineWidth).toEqual(1);
        expect(previewCtxSpy.strokeStyle).toEqual('black');
        expect(previewCtxSpy.setLineDash).toHaveBeenCalledWith([DASH_LENGTH, DASH_SPACE_LENGTH]);
    });

    it('onMouseDown should not call underliyingService.onMouseDown or moveService.onMouseDown if right click', () => {
        const mouseEvent = {
            button: MouseButton.RIGHT,
        } as MouseEvent;

        service.onMouseDown(mouseEvent);
        expect(underlyingServiceSpy.onMouseDown).not.toHaveBeenCalled();
        expect(moveServiceSpy.onMouseDown).not.toHaveBeenCalled();
    });

    it('onMouseDown should call underliyingService.onMouseDown if click is not in selection', () => {
        const mouseEvent = {
            button: MouseButton.LEFT,
        } as MouseEvent;
        const isInSelectionSpy = spyOn(service, 'isInSelection');
        isInSelectionSpy.and.returnValue(false);
        service.moveService.isTransformationOver = true;

        service.onMouseDown(mouseEvent);

        expect(isInSelectionSpy).toHaveBeenCalled();
        expect(service.selection).toEqual({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(underlyingServiceSpy.onMouseDown).toHaveBeenCalled();
    });

    it('onMouseDown should call applypreview if click is not in selection and moveService is currently in transformation', () => {
        const mouseEvent = {
            button: MouseButton.LEFT,
        } as MouseEvent;
        const isInSelectionSpy = spyOn(service, 'isInSelection');
        const applyPreviewSpy = spyOn(service, 'applyPreview');
        isInSelectionSpy.and.returnValue(false);
        service.moveService.isTransformationOver = false;

        service.onMouseDown(mouseEvent);

        expect(isInSelectionSpy).toHaveBeenCalled();
        expect(moveServiceSpy.isTransformationOver).toBeTrue();
        expect(moveServiceSpy.printSelectionOnPreview).toHaveBeenCalled();
        expect(applyPreviewSpy).toHaveBeenCalled();
    });

    it('onMouseDown should call moveService.onMouseDown if click is in selection', () => {
        const mouseEvent = {
            button: MouseButton.LEFT,
        } as MouseEvent;
        const isInSelectionSpy = spyOn(service, 'isInSelection');
        isInSelectionSpy.and.returnValue(true);

        service.onMouseDown(mouseEvent);
        expect(isInSelectionSpy).toHaveBeenCalled();
        expect(service.transormation).toEqual('move');
        expect(moveServiceSpy.onMouseDown).toHaveBeenCalled();
    });

    it('onMouseUp should callgetPositionFromMouse and underlyingService.drawShape', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        getPositionFromMouseSpy.and.returnValue({ x: 0, y: 0 });
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isNewSelection = true;

        service.onMouseUp({} as MouseEvent);

        expect(getPositionFromMouseSpy).toHaveBeenCalledWith({} as MouseEvent);
        expect(underlyingServiceSpy.drawShape).toHaveBeenCalledWith(previewCtxSpy);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onMouseUp should call drawingService.clearCanvas', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        getPositionFromMouseSpy.and.returnValue({ x: 0, y: 0 });
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isNewSelection = true;

        service.onMouseUp({} as MouseEvent);

        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxSpy);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onMouseUp should not change underlyingService.fillStyle', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        getPositionFromMouseSpy.and.returnValue({ x: 0, y: 0 });
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isNewSelection = true;
        service.underlyingService.fillStyle = FILL_STYLES.BORDER;

        service.onMouseUp({} as MouseEvent);

        expect(service.underlyingService.fillStyle).toEqual(FILL_STYLES.BORDER);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onMouseUp should set isNewSelection to false', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        getPositionFromMouseSpy.and.returnValue({ x: 0, y: 0 });
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isNewSelection = true;

        service.onMouseUp({} as MouseEvent);

        expect(service.isNewSelection).toBeFalse();
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onMouseUp should call setInitialSelection and setSelectionData if selection is not empty', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        getPositionFromMouseSpy.and.returnValue({ x: 0, y: 0 });
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 10, height: 10 });
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isNewSelection = true;
        const setInitialSelectionSpy = spyOn(service, 'setSelection');
        const setSelectionDataSpy = spyOn(service, 'setSelectionData');

        service.onMouseUp({} as MouseEvent);

        expect(setInitialSelectionSpy).toHaveBeenCalled();
        expect(setSelectionDataSpy).toHaveBeenCalled();
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onMouseUp should set transformation to empty string if transformation is move', () => {
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isNewSelection = false;
        service.transormation = 'move';

        service.onMouseUp({} as MouseEvent);

        expect(service.transormation).toEqual('');
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onMouseUp should call strokeSelection and setSelectionPoint', () => {
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');

        service.isNewSelection = false;

        service.onMouseUp({} as MouseEvent);

        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call underlyingService.onMouseMove if isNewSelection', () => {
        service.isNewSelection = true;

        service.onMouseMove({} as MouseEvent);

        expect(underlyingServiceSpy.onMouseMove).toHaveBeenCalledWith({} as MouseEvent);
    });

    it('onMouseMove should call moveService.onMouseMove if transformation is move', () => {
        service.isNewSelection = false;
        service.transormation = 'move';

        service.onMouseMove({} as MouseEvent);

        expect(moveServiceSpy.onMouseMove).toHaveBeenCalled();
    });

    it('onMouseMove should not call moveService.onMouseMove or underlyingService.onMouseMove', () => {
        service.isNewSelection = false;
        service.transormation = '';

        service.onMouseMove({} as MouseEvent);

        expect(underlyingServiceSpy.onMouseMove).not.toHaveBeenCalled();
        expect(moveServiceSpy.onMouseMove).not.toHaveBeenCalled();
    });

    it('onKeyDown should call moveService.onKeyDown if selection is not empty', () => {
        service.selection = { startingPoint: { x: 0, y: 0 }, width: 10, height: 10 };

        service.onKeyDown({} as KeyboardEvent);

        expect(moveServiceSpy.onKeyDown).toHaveBeenCalled();
    });

    it('onKeyDown should call underlyingService.onKeyDown if isNewSelection', () => {
        service.isNewSelection = true;

        service.onKeyDown({} as KeyboardEvent);

        expect(underlyingServiceSpy.onKeyDown).toHaveBeenCalledWith({} as KeyboardEvent);
    });

    it('onKeyDown should set isEscapeKeyPressed to true and call reset if EscapeKey pressed', () => {
        const resetSpy = spyOn(service, 'reset');
        const event = {
            key: 'Escape',
        } as KeyboardEvent;

        service.onKeyDown(event);

        expect(service.isEscapeKeyPressed).toBeTrue();
        expect(resetSpy).toHaveBeenCalled();
    });

    it('onKeyDown should set isShiftKeyDown to true and call reset if Shift is pressed', () => {
        const event = {
            key: 'Shift',
        } as KeyboardEvent;

        service.onKeyDown(event);

        expect(service.isShiftKeyDown).toBeTrue();
    });

    it('selectAll should call setInitialSelection, setSelectionData and setSelectionPoint', () => {
        const setInitialSelectionSpy = spyOn(service, 'setSelection');
        const setSelectionDataSpy = spyOn(service, 'setSelectionData');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service['drawingService'].canvas = document.createElement('canvas');
        service['drawingService'].canvas.width = 10;
        service['drawingService'].canvas.height = 10;
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 10, height: 10 });

        service.selectAll();

        expect(setInitialSelectionSpy).toHaveBeenCalled();
        expect(setSelectionDataSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('selectAll should set selection to canvas width and canvas height', () => {
        const setInitialSelectionSpy = spyOn(service, 'setSelection');
        const setSelectionDataSpy = spyOn(service, 'setSelectionData');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service['drawingService'].canvas = document.createElement('canvas');
        service['drawingService'].canvas.width = 10;
        service['drawingService'].canvas.height = 10;
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 10, height: 10 });

        service.selectAll();

        expect(service.selection).toEqual({
            startingPoint: { x: 0, y: 0 },
            width: 10,
            height: 10,
        });

        expect(setInitialSelectionSpy).toHaveBeenCalled();
        expect(setSelectionDataSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('selectAll should call clear canvas', () => {
        const setInitialSelectionSpy = spyOn(service, 'setSelection');
        const setSelectionDataSpy = spyOn(service, 'setSelectionData');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service['drawingService'].canvas = document.createElement('canvas');
        service['drawingService'].canvas.width = 10;
        service['drawingService'].canvas.height = 10;
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 10, height: 10 });

        service.selectAll();

        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(setInitialSelectionSpy).toHaveBeenCalled();
        expect(setSelectionDataSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('selectAll should set attributes for underlyingService', () => {
        const setInitialSelectionSpy = spyOn(service, 'setSelection');
        const setSelectionDataSpy = spyOn(service, 'setSelectionData');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service['drawingService'].canvas = document.createElement('canvas');
        service['drawingService'].canvas.width = 10;
        service['drawingService'].canvas.height = 10;
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 10, height: 10 });

        service.selectAll();

        expect(underlyingServiceSpy.firstPoint).toEqual({ x: 0, y: 0 });
        expect(underlyingServiceSpy.lastPoint).toEqual({ x: 10, y: 10 });
        expect(underlyingServiceSpy.fillStyle).toEqual(FILL_STYLES.DASHED);
        expect(setInitialSelectionSpy).toHaveBeenCalled();
        expect(setSelectionDataSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onKeyUp  should call moveService.onKeyUp and setSelectionPoint', () => {
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isShiftKeyDown = true;

        service.onKeyUp({} as KeyboardEvent);

        expect(moveServiceSpy.onKeyUp).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onKeyUp  should call underlyingService.onKeyUp and strokeSelection if isShiftKeyDown', () => {
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        service.isShiftKeyDown = false;

        service.onKeyUp({} as KeyboardEvent);

        expect(underlyingServiceSpy.onKeyUp).toHaveBeenCalled();
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onKeyUp should set underlyingService.isShiftKeyDown to false and isShiftKeyDown to false if shift key up', () => {
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isShiftKeyDown = true;
        service.underlyingService.isShiftKeyDown = true;

        service.onKeyUp({ key: 'Shift' } as KeyboardEvent);

        expect(service.isShiftKeyDown).toBeFalse();
        expect(service.underlyingService.isShiftKeyDown).toBeFalse();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onKeyUp should set underlyingService.isShiftKeyDown to false and isShiftKeyDown to false if shift key up', () => {
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isShiftKeyDown = true;
        service.isNewSelection = true;

        service.onKeyUp({ key: 'Shift' } as KeyboardEvent);

        expect(service.underlyingService.onKeyUp).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('isInSelection should return false when selection is empty', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        getPositionFromMouseSpy.and.returnValue({ x: 1, y: 2 });

        const result = service.isInSelection({} as MouseEvent);

        expect(result).toBeFalse();
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
    });

    it('isInSelection should return false when mouseEvent is out of selection', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        getPositionFromMouseSpy.and.returnValue({ x: 14, y: 14 });

        service.selection = {
            startingPoint: { x: 0, y: 0 },
            width: 10,
            height: 10,
        };

        const result = service.isInSelection({} as MouseEvent);

        expect(result).toBeFalse();
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
    });

    it('isInSelection should return true when mouseEvent is in of selection', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        getPositionFromMouseSpy.and.returnValue({ x: 1, y: 2 });

        service.selection = {
            startingPoint: { x: 0, y: 0 },
            width: 10,
            height: 10,
        };

        const result = service.isInSelection({} as MouseEvent);

        expect(result).toBeTrue();
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
    });

    it('reset should call previewCtx.setLineDash and drawingService.clearCanvas', () => {
        service.reset();

        expect(previewCtxSpy.setLineDash).toHaveBeenCalledWith([0]);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxSpy);
    });

    it('reset should reset internal attributes', () => {
        service.reset();

        expect(service.selection).toEqual({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        expect(service.mouseDown).toBeFalse();
        expect(service.transormation).toEqual('');
    });

    it('reset should reset moveService attributes attributes', () => {
        service.reset();

        expect(moveServiceSpy.initialSelection).toEqual({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        expect(moveServiceSpy.isTransformationOver).toBeTrue();
    });

    it('reset should call moveService.printSelectionOnPreview and applyPreview', () => {
        const applyPreviewSpy = spyOn(service, 'applyPreview');

        service.selection = {
            startingPoint: { x: 0, y: 0 },
            width: 10,
            height: 10,
        };

        service.reset();

        expect(moveServiceSpy.printSelectionOnPreview).toHaveBeenCalled();
        expect(applyPreviewSpy).toHaveBeenCalled();
    });

    it('setInitialSelection should set initial selection', () => {
        const selection: SelectionBox = {
            startingPoint: { x: 0, y: 0 },
            width: 10,
            height: 10,
        };

        service.setSelection(service.initialSelection, selection);

        expect(service.initialSelection).toEqual(selection);
    });

    it('applyPreview should update selection data', () => {
        const updateSelectionDataSpy = spyOn(service, 'updateSelectionData');

        service.applyPreview();

        expect(updateSelectionDataSpy).toHaveBeenCalled();
    });

    it('applyPreview should draw on baseCtx', () => {
        const updateSelectionDataSpy = spyOn(service, 'updateSelectionData');

        service.applyPreview();

        expect(drawingServiceSpy.applyPreview).toHaveBeenCalled();
        expect(updateSelectionDataSpy).toHaveBeenCalled();
    });

    it('applyPreview should get canvas and save it in canvasData', () => {
        const updateSelectionDataSpy = spyOn(service, 'updateSelectionData');
        const canvasData: ImageData = { data: new Uint8ClampedArray([1, 1, 1, 1, 0, 0, 0, 1]), height: 1, width: 2 };
        drawingServiceSpy.getCanvasData.and.returnValue(canvasData);

        service.applyPreview();

        expect(drawingServiceSpy.getCanvasData).toHaveBeenCalled();
        expect(service.canvasData).toEqual(canvasData);
        expect(updateSelectionDataSpy).toHaveBeenCalled();
    });

    it('applyPreview should update undo stack with selection data', () => {
        const updateSelectionDataSpy = spyOn(service, 'updateSelectionData');

        service.applyPreview();

        expect(drawingServiceSpy.updateStack).toHaveBeenCalledWith(service.selectionData);
        expect(updateSelectionDataSpy).toHaveBeenCalled();
    });

    it('updateSelectionData should set selectionData', () => {
        const imageData: ImageData = { data: new Uint8ClampedArray([1, 1, 1, 1, 0, 0, 0, 1]), height: 1, width: 2 };
        service.selectionData = { type: '', imageData };
        const canvasData: ImageData = { data: new Uint8ClampedArray([2, 2, 2, 2, 2, 2, 2, 1]), height: 1, width: 2 };
        service.canvasData = canvasData;

        service.updateSelectionData();

        expect(service.selectionData).toEqual({
            type: 'selection',
            imageData: canvasData,
        });
    });

    it('setSelectionPoint should draw 8 blue squares if selection is not empty', () => {
        service.selection = { startingPoint: { x: 0, y: 0 }, width: 10, height: 10 };
        previewCtxSpy.fillStyle = 'black';

        service.setSelectionPoint();

        expect(previewCtxSpy.fillStyle).toEqual('#09acd9');
        expect(previewCtxSpy.fillRect).toHaveBeenCalledTimes(8);
    });

    it('setSelectionPoint should draw 8 blue squares around selection', () => {
        service.selection = { startingPoint: { x: 0, y: 0 }, width: 10, height: 10 };

        service.setSelectionPoint();

        expect(previewCtxSpy.fillRect).toHaveBeenCalledWith(-3, -3, 6, 6);
        expect(previewCtxSpy.fillRect).toHaveBeenCalledWith(2, -3, 6, 6);
        expect(previewCtxSpy.fillRect).toHaveBeenCalledWith(7, -3, 6, 6);
        expect(previewCtxSpy.fillRect).toHaveBeenCalledWith(-3, 2, 6, 6);
        expect(previewCtxSpy.fillRect).toHaveBeenCalledWith(7, 2, 6, 6);
        expect(previewCtxSpy.fillRect).toHaveBeenCalledWith(-3, 2, 6, 6);
        expect(previewCtxSpy.fillRect).toHaveBeenCalledWith(2, 7, 6, 6);
        expect(previewCtxSpy.fillRect).toHaveBeenCalledWith(7, 7, 6, 6);
    });

    it('setSelectionPoint should not draw blue squares if selection is empty', () => {
        service.setSelectionPoint();
        expect(previewCtxSpy.fillRect).not.toHaveBeenCalled();
    });

    it('should set grid spacing on setGridSpacing call', () => {
        service.squareSize = 5;
        service.setGridSpacing(10);
        expect(service.squareSize).toEqual(10);
    });

    it('should set magnetism on enableMagnetism call', () => {
        service.isMagnetism = false;
        service.enableMagnetism(true);
        expect(service.isMagnetism).toEqual(true);
    });

    it('should call onMouseMoveMagnetism if magnetism is enabled and the transformation is move', () => {
        const mouveMoveMagnetismSpy = spyOn(service, 'onMouseMoveMagnetism');
        service.isNewSelection = false;
        service.transormation = 'move';
        service.isMagnetism = true;
        service.onMouseMove({} as MouseEvent);
        expect(mouveMoveMagnetismSpy).toHaveBeenCalled();
    });

    it('should call the method in magnetismService on onMouseMoveMagnetism call', () => {
        service.onMouseMoveMagnetism(2, 2);
        expect(magnetismServiceSpy.magnetismXAxisChange).toHaveBeenCalled();
        expect(magnetismServiceSpy.magnetismYAxisChange).toHaveBeenCalled();
        expect(magnetismServiceSpy.onMouseMoveMagnetism).toHaveBeenCalled();
    });

    it('should return false if coordinates are not on grid', () => {
        service.squareSize = 3;
        expect(service.isSnappedOnGrid({ x: 2, y: 2 })).toBeFalsy();
    });

    it('should return true if coordinates are on grid', () => {
        service.squareSize = 2;
        expect(service.isSnappedOnGrid({ x: 4, y: 4 })).toBeTruthy();
    });

    it('onKeyDown should call snap on grid if it is not snapped', () => {
        service.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        service.isMagnetism = true;
        const isSnappedOnGridSpy = spyOn(service, 'isSnappedOnGrid').and.returnValue(false);
        service.onKeyDown({} as KeyboardEvent);

        expect(isSnappedOnGridSpy).toHaveBeenCalled();
        expect(moveServiceSpy.snapOnGrid).toHaveBeenCalled();
    });
});
