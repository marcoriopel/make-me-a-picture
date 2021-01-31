import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { ALIGNMENT_NAMES } from '@app/ressources/global-variables/alignment-names';
import { MouseButton } from '@app/ressources/global-variables/global-variables';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MoveService } from '@app/services/tools/transformation-services/move.service';
import { RotateService } from '@app/services/tools/transformation-services/rotate.service';
import { MagicWandService } from './magic-wand.service';
import { MagnetismService } from './magnetism.service';
import SpyObj = jasmine.SpyObj;

// tslint:disable: no-magic-numbers
describe('MagicWandService', () => {
    let service: MagicWandService;
    let drawingService: DrawingService;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let gridCanvasStub: HTMLCanvasElement;
    let moveServiceSpy: jasmine.SpyObj<MoveService>;
    let rotateServiceSpy: jasmine.SpyObj<RotateService>;
    let drawingServiceSpy: SpyObj<DrawingService>;
    let magnetismServiceSpy: SpyObj<MagnetismService>;
    let colorSelectionServiceSpy: SpyObj<ColorSelectionService>;
    let mouseEvent: MouseEvent;
    let keyboardEvent: KeyboardEvent;
    const WIDTH = 100;
    const HEIGHT = 100;

    beforeEach(() => {
        magnetismServiceSpy = jasmine.createSpyObj('MagnetismService', [
            'magnetismXAxisChange',
            'magnetismYAxisChange',
            'onMouseMoveMagnetism',
            'magnetismCoordinateReference',
        ]);
        colorSelectionServiceSpy = jasmine.createSpyObj('ColorSelectionService', [
            'clearCanvas',
            'getCanvasData',
            'updateStack',
            'setIsToolInUse',
            'applyPreview',
        ]);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['setIsToolInUse', 'clearCanvas', 'getPixelData', 'getCanvasData', 'updateStack']);

        moveServiceSpy = jasmine.createSpyObj('MoveService', ['onMouseDown', 'printSelectionOnPreview', 'onKeyUp', 'onMouseMove', 'initialize']);
        rotateServiceSpy = jasmine.createSpyObj('RotateService', ['restoreSelection', 'onKeyUp', 'initialize', 'rotatePreviewCanvas']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: MoveService, useValue: moveServiceSpy },
                { provide: RotateService, useValue: rotateServiceSpy },
                { provide: MagnetismService, useValue: magnetismServiceSpy },
                { provide: ColorSelectionService, useValue: colorSelectionServiceSpy },
            ],
        });
        service = TestBed.inject(MagicWandService);
        drawingService = TestBed.inject(DrawingService);

        const drawCanvas = document.createElement('canvas');
        drawCanvas.width = WIDTH;
        drawCanvas.height = HEIGHT;
        previewCtxStub = drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        const canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvasStub = canvas as HTMLCanvasElement;
        gridCanvasStub = canvas as HTMLCanvasElement;

        drawingService.previewCtx = previewCtxStub;
        drawingService.canvas = canvasStub;
        drawingService.gridCanvas = gridCanvasStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;

        keyboardEvent = new KeyboardEvent('keypress', {
            key: 'Shift',
        });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set line dash of previewctx on initialize', () => {
        const setLineDashSpy = spyOn(drawingService.previewCtx, 'setLineDash');
        service.initialize();
        expect(setLineDashSpy).toHaveBeenCalled();
    });

    it('should set cursor to crosshair on handleCursorCall with previewLayer correctly loaded', () => {
        drawingService.gridCanvas.style.cursor = 'none';
        service.setCursor();
        expect(gridCanvasStub.style.cursor).toEqual('crosshair');
    });

    it('should call onMouseDown of moveService if in selection', () => {
        const isInSelectionSpy = spyOn(service, 'isInSelection').and.returnValue(true);
        service.onMouseDown(mouseEvent);
        expect(isInSelectionSpy).toHaveBeenCalled();
        expect(moveServiceSpy.onMouseDown).toHaveBeenCalled();
    });

    it('should call the contiguous function on left click if it is not in selection', () => {
        moveServiceSpy.isTransformationOver = true;
        rotateServiceSpy.isRotationOver = true;
        const isInSelectionSpy = spyOn(service, 'isInSelection').and.returnValue(false);
        const setContiguousWandSpy = spyOn(service, 'setContiguousWand');
        service.onMouseDown(mouseEvent);
        expect(isInSelectionSpy).toHaveBeenCalled();
        expect(setContiguousWandSpy).toHaveBeenCalled();
    });

    it('should not call the wand function on right click if it is not in selection but selection is not over', () => {
        service.isSelectionOver = false;
        const mouseEventRight = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.RIGHT,
        } as MouseEvent;
        moveServiceSpy.isTransformationOver = true;
        rotateServiceSpy.isRotationOver = true;
        const isInSelectionSpy = spyOn(service, 'isInSelection').and.returnValue(false);
        const setWandSpy = spyOn(service, 'setWand');
        service.onMouseDown(mouseEventRight);
        expect(isInSelectionSpy).toHaveBeenCalled();
        expect(setWandSpy).not.toHaveBeenCalled();
    });

    it('should call the wand function on right click if it is not in selection', () => {
        const mouseEventRight = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.RIGHT,
        } as MouseEvent;
        moveServiceSpy.isTransformationOver = true;
        rotateServiceSpy.isRotationOver = true;
        const isInSelectionSpy = spyOn(service, 'isInSelection').and.returnValue(false);
        const setWandSpy = spyOn(service, 'setWand');
        service.onMouseDown(mouseEventRight);
        expect(isInSelectionSpy).toHaveBeenCalled();
        expect(setWandSpy).toHaveBeenCalled();
    });

    it('should call the contiguous function on left click if it is not in selection and transformation and rotation are not over', () => {
        moveServiceSpy.isTransformationOver = false;
        rotateServiceSpy.isRotationOver = false;
        const isInSelectionSpy = spyOn(service, 'isInSelection').and.returnValue(false);
        const applyPreviewSpy = spyOn(service, 'applyPreview');
        const setContiguousWandSpy = spyOn(service, 'setContiguousWand');
        service.onMouseDown(mouseEvent);
        expect(isInSelectionSpy).toHaveBeenCalled();
        expect(applyPreviewSpy).toHaveBeenCalled();
        expect(setContiguousWandSpy).toHaveBeenCalled();
    });

    it('should call setSelection on mouseup if it is a new selection', () => {
        service.isNewSelection = true;
        service.transormation = '';
        service.selection = { startingPoint: { x: 0, y: 0 }, width: 5, height: 5 };
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setInitialSelectionSpy = spyOn(service, 'setSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.onMouseUp(mouseEvent);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setInitialSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('should not call setSelection on mouseup if it is a new selection but size of selection is null', () => {
        service.isNewSelection = true;
        service.transormation = '';
        service.selection = { startingPoint: { x: 0, y: 0 }, width: 0, height: 0 };
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setInitialSelectionSpy = spyOn(service, 'setSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.onMouseUp(mouseEvent);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setInitialSelectionSpy).not.toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('should call strokeSelection on mouseup if it is not a new selection', () => {
        service.isNewSelection = false;
        service.transormation = '';
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.onMouseUp(mouseEvent);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('should set transformation to nothing on mouseup if it was move', () => {
        service.isNewSelection = false;
        service.transormation = 'move';
        service.selection = { startingPoint: { x: 0, y: 0 }, width: 5, height: 5 };
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.onMouseUp(mouseEvent);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
        expect(service.transormation).toEqual('');
    });

    it('should call onkeyup of move and rotate', () => {
        service.onKeyUp(keyboardEvent);
        expect(moveServiceSpy.onKeyUp).toHaveBeenCalled();
        expect(rotateServiceSpy.onKeyUp).toHaveBeenCalled();
    });

    it('should call onMouseMoveMagnetism if transformation and isMagnetism', () => {
        const onMouseMoveMagnetismSpy = spyOn(service, 'onMouseMoveMagnetism');
        service.transormation = 'move';
        service.isMagnetism = true;
        service.onMouseMove(mouseEvent);
        expect(onMouseMoveMagnetismSpy).toHaveBeenCalled();
    });

    it('should call onMouseMove of move service if not magnetism', () => {
        service.transormation = 'move';
        service.isMagnetism = false;
        service.onMouseMove(mouseEvent);
        expect(moveServiceSpy.onMouseMove).toHaveBeenCalled();
    });

    it('should not call anything onMouseMove if transformation is not move', () => {
        const onMouseMoveMagnetismSpy = spyOn(service, 'onMouseMoveMagnetism');
        service.transormation = '';
        service.onMouseMove(mouseEvent);
        expect(moveServiceSpy.onMouseMove).not.toHaveBeenCalled();
        expect(onMouseMoveMagnetismSpy).not.toHaveBeenCalled();
    });

    it('should set corner value minX if value is minimum', () => {
        service.cornerSelectionValues = new Map([
            ['minX', 5],
            ['maxX', 0],
            ['minY', 0],
            ['maxY', 0],
        ]);
        service.adjustCornerSelectionValues({ x: 2, y: 0 });
        expect(service.cornerSelectionValues.get('minX')).toEqual(2);
    });

    it('should set corner value minY if value is minimum', () => {
        service.cornerSelectionValues = new Map([
            ['minX', 0],
            ['maxX', 0],
            ['minY', 5],
            ['maxY', 0],
        ]);
        service.adjustCornerSelectionValues({ x: 0, y: 2 });
        expect(service.cornerSelectionValues.get('minY')).toEqual(2);
    });

    it('should set corner value maxX if value is maximum', () => {
        service.cornerSelectionValues = new Map([
            ['minX', 0],
            ['maxX', 2],
            ['minY', 0],
            ['maxY', 0],
        ]);
        service.adjustCornerSelectionValues({ x: 5, y: 0 });
        expect(service.cornerSelectionValues.get('maxX')).toEqual(5);
    });

    it('should set corner value maxY if value is maximum', () => {
        service.cornerSelectionValues = new Map([
            ['minX', 0],
            ['maxX', 0],
            ['minY', 0],
            ['maxY', 2],
        ]);
        service.adjustCornerSelectionValues({ x: 0, y: 5 });
        expect(service.cornerSelectionValues.get('maxY')).toEqual(5);
    });

    it('should add pixel and check the next pixels on contiguous wand', () => {
        service.mouseDownCoord = { x: 5, y: 5 };
        drawingServiceSpy.canvas.width = 5;
        drawingServiceSpy.canvas.height = 5;
        const isSameColorSpy = spyOn(service, 'isSameColor').and.returnValue(true);
        const addPixelToSelectionSpy = spyOn(service, 'addPixelToSelection');
        const adjustCornerSelectionValuesSpy = spyOn(service, 'adjustCornerSelectionValues');
        const nextContiguousPixelsSpy = spyOn(service, 'nextContiguousPixels');
        const setSelectionDataSpy = spyOn(service, 'setSelectionData');
        service.setContiguousWand();
        expect(isSameColorSpy).toHaveBeenCalled();
        expect(addPixelToSelectionSpy).toHaveBeenCalled();
        expect(adjustCornerSelectionValuesSpy).toHaveBeenCalled();
        expect(nextContiguousPixelsSpy).toHaveBeenCalled();
        expect(setSelectionDataSpy).toHaveBeenCalled();
    });

    it('should not add pixel and check the next pixels on contiguous wand if not the same color', () => {
        service.mouseDownCoord = { x: 5, y: 5 };
        drawingServiceSpy.canvas.width = 5;
        drawingServiceSpy.canvas.height = 5;
        const isSameColorSpy = spyOn(service, 'isSameColor').and.returnValue(false);
        const addPixelToSelectionSpy = spyOn(service, 'addPixelToSelection');
        const adjustCornerSelectionValuesSpy = spyOn(service, 'adjustCornerSelectionValues');
        const nextContiguousPixelsSpy = spyOn(service, 'nextContiguousPixels');
        const setSelectionDataSpy = spyOn(service, 'setSelectionData');
        service.setContiguousWand();
        expect(isSameColorSpy).toHaveBeenCalled();
        expect(addPixelToSelectionSpy).not.toHaveBeenCalled();
        expect(adjustCornerSelectionValuesSpy).not.toHaveBeenCalled();
        expect(nextContiguousPixelsSpy).not.toHaveBeenCalled();
        expect(setSelectionDataSpy).toHaveBeenCalled();
    });

    it('should skip pixel if pixel was already checked', () => {
        service.mouseDownCoord = { x: 5, y: 5 };
        drawingServiceSpy.canvas.width = 5;
        drawingServiceSpy.canvas.height = 5;
        const vec2ToStringSpy = spyOn(service, 'Vec2ToString').and.returnValue('5,5');
        const isSameColorSpy = spyOn(service, 'isSameColor').and.returnValue(true);
        const addPixelToSelectionSpy = spyOn(service, 'addPixelToSelection');
        const adjustCornerSelectionValuesSpy = spyOn(service, 'adjustCornerSelectionValues');
        const nextContiguousPixelsSpy = spyOn(service, 'nextContiguousPixels').and.callThrough();
        const setSelectionDataSpy = spyOn(service, 'setSelectionData');
        service.setContiguousWand();
        expect(isSameColorSpy).toHaveBeenCalled();
        expect(vec2ToStringSpy).toHaveBeenCalled();
        expect(addPixelToSelectionSpy).toHaveBeenCalled();
        expect(adjustCornerSelectionValuesSpy).toHaveBeenCalledTimes(1);
        expect(nextContiguousPixelsSpy).toHaveBeenCalled();
        expect(setSelectionDataSpy).toHaveBeenCalled();
    });

    it('should push pixels to stack when they are valid', () => {
        service.stack = [];
        drawingServiceSpy.canvas.width = 5;
        drawingServiceSpy.canvas.height = 5;
        const currentPixel = { x: 2, y: 2 };
        const canvasData = new ImageData(10, 10);
        const addSecondaryToleranceSpy = spyOn(service, 'addSecondaryTolerance');
        const isSameColorSpy = spyOn(service, 'isSameColor').and.returnValue(true);
        service.nextContiguousPixels(currentPixel, canvasData);
        expect(isSameColorSpy).toHaveBeenCalled();
        expect(addSecondaryToleranceSpy).not.toHaveBeenCalled();
        expect(service.stack.length).toEqual(4);
    });

    it('should not push pixels to stack when they are not the same color', () => {
        service.stack = [];
        drawingServiceSpy.canvas.width = 5;
        drawingServiceSpy.canvas.height = 5;
        const currentPixel = { x: 2, y: 2 };
        const canvasData = new ImageData(10, 10);
        const addSecondaryToleranceSpy = spyOn(service, 'addSecondaryTolerance');
        const isSameColorSpy = spyOn(service, 'isSameColor').and.returnValue(false);
        service.nextContiguousPixels(currentPixel, canvasData);
        expect(isSameColorSpy).toHaveBeenCalled();
        expect(addSecondaryToleranceSpy).toHaveBeenCalled();
        expect(service.stack.length).toEqual(0);
    });

    it('should not do anything if pixels are out of canvas', () => {
        service.stack = [];
        drawingServiceSpy.canvas.width = 0;
        drawingServiceSpy.canvas.height = 0;
        const currentPixel = { x: 0, y: 0 };
        const canvasData = new ImageData(10, 10);
        service.nextContiguousPixels(currentPixel, canvasData);
        expect(service.stack.length).toEqual(0);
    });

    it('should add pixel to selection', () => {
        const canvasData = new ImageData(10, 10);
        service.selectionImageData = new ImageData(10, 10);
        service.selectionImageData.data[0] = 0;
        service.selectionImageData.data[1] = 0;
        service.selectionImageData.data[2] = 0;
        service.selectionImageData.data[3] = 0;
        canvasData.data[0] = 253;
        canvasData.data[1] = 253;
        canvasData.data[2] = 253;
        canvasData.data[3] = 15;
        service.addPixelToSelection(0, canvasData);
        expect(service.selectionImageData.data[0]).toEqual(253);
        expect(service.selectionImageData.data[1]).toEqual(253);
        expect(service.selectionImageData.data[2]).toEqual(253);
        expect(service.selectionImageData.data[3]).toEqual(15);
    });

    it('should add pixel to selection if it is the color of secondary tolerance', () => {
        const canvasData = new ImageData(10, 10);
        const pixelData = new Uint8ClampedArray();
        const adjustCornerSelectionValuesSpy = spyOn(service, 'adjustCornerSelectionValues');
        const isSameColorSpy = spyOn(service, 'isSameColor').and.returnValue(true);
        service.selectionImageData = new ImageData(10, 10);
        service.selectionImageData.data[0] = 0;
        service.selectionImageData.data[1] = 0;
        service.selectionImageData.data[2] = 0;
        service.selectionImageData.data[3] = 0;
        canvasData.data[0] = 253;
        canvasData.data[1] = 253;
        canvasData.data[2] = 253;
        canvasData.data[3] = 15;
        service.addSecondaryTolerance(pixelData, 0, canvasData, { x: 0, y: 0 });
        expect(isSameColorSpy).toHaveBeenCalled();
        expect(adjustCornerSelectionValuesSpy).toHaveBeenCalled();
        expect(service.selectionImageData.data[0]).toEqual(253);
        expect(service.selectionImageData.data[1]).toEqual(253);
        expect(service.selectionImageData.data[2]).toEqual(253);
        expect(service.selectionImageData.data[3]).toEqual(15);
    });

    it('should not add pixel to selection if it is not the color of secondary tolerance', () => {
        const canvasData = new ImageData(10, 10);
        const pixelData = new Uint8ClampedArray();
        const adjustCornerSelectionValuesSpy = spyOn(service, 'adjustCornerSelectionValues');
        const isSameColorSpy = spyOn(service, 'isSameColor').and.returnValue(false);
        service.selectionImageData = new ImageData(10, 10);
        service.selectionImageData.data[0] = 0;
        service.selectionImageData.data[1] = 0;
        service.selectionImageData.data[2] = 0;
        service.selectionImageData.data[3] = 0;
        canvasData.data[0] = 253;
        canvasData.data[1] = 253;
        canvasData.data[2] = 253;
        canvasData.data[3] = 15;
        service.addSecondaryTolerance(pixelData, 0, canvasData, { x: 0, y: 0 });
        expect(isSameColorSpy).toHaveBeenCalled();
        expect(adjustCornerSelectionValuesSpy).not.toHaveBeenCalled();
        expect(service.selectionImageData.data[0]).toEqual(0);
        expect(service.selectionImageData.data[1]).toEqual(0);
        expect(service.selectionImageData.data[2]).toEqual(0);
        expect(service.selectionImageData.data[3]).toEqual(0);
    });

    it('should put image data and initialize services when setting the selection data', () => {
        const putImageDataSpy = spyOn(service.selectionImageCtx, 'putImageData');
        service.setSelectionData();
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(moveServiceSpy.initialize).toHaveBeenCalled();
        expect(rotateServiceSpy.initialize).toHaveBeenCalled();
        expect(drawingServiceSpy.updateStack).toHaveBeenCalled();
    });

    it('should stroke selection if selection size is not null', () => {
        const setBorderCanvasSpy = spyOn(service, 'setBorderCanvas');
        service.selection.height = 5;
        service.selection.width = 5;
        service.strokeSelection();
        expect(setBorderCanvasSpy).toHaveBeenCalled();
        expect(rotateServiceSpy.rotatePreviewCanvas).toHaveBeenCalled();
    });

    it('should not stroke selection if selection size is null', () => {
        const setBorderCanvasSpy = spyOn(service, 'setBorderCanvas');
        service.selection.height = 0;
        service.selection.width = 0;
        service.strokeSelection();
        expect(setBorderCanvasSpy).not.toHaveBeenCalled();
        expect(rotateServiceSpy.rotatePreviewCanvas).not.toHaveBeenCalled();
    });

    it('should return the border pattern ', () => {
        drawingServiceSpy.previewCtx.fillStyle = service.setBorderPattern();
        expect(drawingServiceSpy.previewCtx.fillStyle).toBeInstanceOf(CanvasPattern);
    });

    it('should set the border canvas ', () => {
        const drawImageBorderSpy = spyOn(service.borderCanvasCtx, 'drawImage');
        const drawImagePreviewSpy = spyOn(drawingServiceSpy.previewCtx, 'drawImage');
        service.setBorderCanvas();
        expect(drawImageBorderSpy).toHaveBeenCalled();
        expect(drawImagePreviewSpy).toHaveBeenCalled();
    });

    it('isSameColor should return true if pixelData is the same as ImageData with tolerance 0', () => {
        const pixelData: Uint8ClampedArray = new Uint8ClampedArray([255, 255, 255, 255]);
        const canvasData: ImageData = { data: new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255]), height: 1, width: 2 };
        const index = 0;
        expect(service.isSameColor(pixelData, canvasData, index, 0)).toBe(true);
    });

    it('isSameColor should return false if pixelData is not the same as ImageData with tolerance 0', () => {
        const pixelData: Uint8ClampedArray = new Uint8ClampedArray([255, 255, 255, 255]);
        const canvasData: ImageData = { data: new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255]), height: 1, width: 2 };
        const index = 4;

        expect(service.isSameColor(pixelData, canvasData, index, 0)).toBe(false);
    });

    it('Vec2ToString should return Vec2 as string value', () => {
        const vector2D: Vec2 = { x: 1, y: 0 };
        const expectedOutput = '1,0';

        expect(service.Vec2ToString(vector2D)).toBe(expectedOutput);
    });

    it('should check all pixels with wand and add if same', () => {
        const canvasData = new ImageData(10, 10);
        drawingServiceSpy.getCanvasData.and.returnValue(canvasData);
        service.mouseDownCoord = { x: 5, y: 5 };
        drawingServiceSpy.canvas.width = 5;
        drawingServiceSpy.canvas.height = 5;
        const isSameColorSpy = spyOn(service, 'isSameColor').and.returnValue(true);
        const addPixelToSelectionSpy = spyOn(service, 'addPixelToSelection');
        const adjustCornerSelectionValuesSpy = spyOn(service, 'adjustCornerSelectionValues');
        const setSelectionDataSpy = spyOn(service, 'setSelectionData');
        service.setWand();
        expect(isSameColorSpy).toHaveBeenCalled();
        expect(addPixelToSelectionSpy).toHaveBeenCalled();
        expect(adjustCornerSelectionValuesSpy).toHaveBeenCalled();
        expect(setSelectionDataSpy).toHaveBeenCalled();
    });

    it('should check all pixels with wand and not add if not the same', () => {
        const canvasData = new ImageData(10, 10);
        drawingServiceSpy.getCanvasData.and.returnValue(canvasData);
        service.mouseDownCoord = { x: 5, y: 5 };
        drawingServiceSpy.canvas.width = 5;
        drawingServiceSpy.canvas.height = 5;
        const isSameColorSpy = spyOn(service, 'isSameColor').and.returnValue(false);
        const addPixelToSelectionSpy = spyOn(service, 'addPixelToSelection');
        const adjustCornerSelectionValuesSpy = spyOn(service, 'adjustCornerSelectionValues');
        const setSelectionDataSpy = spyOn(service, 'setSelectionData');
        service.setWand();
        expect(isSameColorSpy).toHaveBeenCalled();
        expect(addPixelToSelectionSpy).not.toHaveBeenCalled();
        expect(adjustCornerSelectionValuesSpy).not.toHaveBeenCalled();
        expect(setSelectionDataSpy).toHaveBeenCalled();
    });

    it('should setMagnetismAlignment', () => {
        service.currentAlignment = ALIGNMENT_NAMES.ALIGN_BOTTOM_CENTER_NAME;
        service.setMagnetismAlignment(ALIGNMENT_NAMES.ALIGN_CENTER_LEFT_NAME);
        expect(service.currentAlignment).toEqual(ALIGNMENT_NAMES.ALIGN_CENTER_LEFT_NAME);
    });

    // tslint:disable-next-line: max-file-line-count
});
