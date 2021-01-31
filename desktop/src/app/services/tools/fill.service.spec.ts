import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/ressources/global-variables/global-variables';
import { Rgba } from '@app/ressources/global-variables/rgba';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FillService } from './fill.service';
import SpyObj = jasmine.SpyObj;

// tslint:disable: no-magic-numbers

describe('FillService', () => {
    let service: FillService;
    let drawingServiceSpy: SpyObj<DrawingService>;
    let colorSelectionServiceSpy: SpyObj<ColorSelectionService>;
    let baseCtxSpy: SpyObj<CanvasRenderingContext2D>;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['getPixelData', 'getCanvasData', 'updateStack', 'setIsToolInUse', 'autoSave']);
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['putImageData']);
        baseCtxSpy.filter = 'none';
        drawingServiceSpy.baseCtx = baseCtxSpy;
        colorSelectionServiceSpy = jasmine.createSpyObj('ColorSelectionService', ['getRgbaPrimaryColor']);
        colorSelectionServiceSpy.primaryColor = 'red';

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: ColorSelectionService, useValue: colorSelectionServiceSpy },
            ],
        });

        service = TestBed.inject(FillService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change tolerance', () => {
        const newTolerance = 5;
        service.tolerance = 0;
        service.changeTolerance(newTolerance);
        expect(service.tolerance).toBe(newTolerance);
    });

    it('onMouseDown should call drawing service.getPixelData with mouseEvent position', () => {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.height = 10;
        canvas.width = 10;
        const baseCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const previewCtx = canvas.getContext('2d') as CanvasRenderingContext2D;

        baseCtx.fillStyle = 'white';
        baseCtx.fillRect(0, 0, canvas.width, canvas.height);
        baseCtx.strokeStyle = 'black';
        baseCtx.strokeRect(0, 0, 5, 5);

        previewCtx.fillStyle = 'white';
        previewCtx.fillRect(0, 0, canvas.width, canvas.height);
        previewCtx.strokeStyle = 'black';
        previewCtx.strokeRect(0, 0, 5, 5);

        drawingServiceSpy.baseCtx = baseCtx;
        drawingServiceSpy.previewCtx = previewCtx;
        drawingServiceSpy.canvas = canvas;

        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.MIDDLE,
        } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(drawingServiceSpy.getPixelData).toHaveBeenCalledWith({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
    });

    it('onMouseDown should set drawingservice.baseCtx.fillStyle and call contiguousFill on left click', () => {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.height = 10;
        canvas.width = 10;
        const baseCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const previewCtx = canvas.getContext('2d') as CanvasRenderingContext2D;

        baseCtx.fillStyle = 'white';
        baseCtx.fillRect(0, 0, canvas.width, canvas.height);
        baseCtx.strokeStyle = 'black';
        baseCtx.strokeRect(0, 0, 5, 5);

        previewCtx.fillStyle = 'white';
        previewCtx.fillRect(0, 0, canvas.width, canvas.height);
        previewCtx.strokeStyle = 'black';
        previewCtx.strokeRect(0, 0, 5, 5);

        drawingServiceSpy.baseCtx = baseCtx;
        drawingServiceSpy.previewCtx = previewCtx;
        drawingServiceSpy.canvas = canvas;

        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;
        const contiguousFillSpy = spyOn(service, 'contiguousFill');

        service.onMouseDown(mouseEvent);
        expect(drawingServiceSpy.baseCtx.fillStyle).toBe('#ff0000'); // red in hexa
        expect(contiguousFillSpy).toHaveBeenCalled();
    });

    it('onMouseDown should call fill on right click', () => {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.height = 10;
        canvas.width = 10;
        const baseCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const previewCtx = canvas.getContext('2d') as CanvasRenderingContext2D;

        baseCtx.fillStyle = 'white';
        baseCtx.fillRect(0, 0, canvas.width, canvas.height);
        baseCtx.strokeStyle = 'black';
        baseCtx.strokeRect(0, 0, 5, 5);

        previewCtx.fillStyle = 'white';
        previewCtx.fillRect(0, 0, canvas.width, canvas.height);
        previewCtx.strokeStyle = 'black';
        previewCtx.strokeRect(0, 0, 5, 5);

        drawingServiceSpy.baseCtx = baseCtx;
        drawingServiceSpy.previewCtx = previewCtx;
        drawingServiceSpy.canvas = canvas;

        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.RIGHT,
        } as MouseEvent;
        const fillSpy = spyOn(service, 'fill');

        service.onMouseDown(mouseEvent);
        expect(fillSpy).toHaveBeenCalled();
    });

    it('contiguousFill should only fill rectangle on canvas', () => {
        // create a dummy canvas with a filled rectangle
        const canvasCompare: HTMLCanvasElement = document.createElement('canvas');
        canvasCompare.height = 10;
        canvasCompare.width = 10;
        const baseCtxCompare = canvasCompare.getContext('2d') as CanvasRenderingContext2D;
        baseCtxCompare.fillStyle = 'white';
        baseCtxCompare.fillRect(0, 0, canvasCompare.width, canvasCompare.height);
        baseCtxCompare.strokeStyle = 'black';
        baseCtxCompare.strokeRect(0, 0, 5, 5);
        baseCtxCompare.fillStyle = 'blue';
        baseCtxCompare.fillRect(1, 1, 3, 3);

        // create a canvas with a rectangle that is not yet filled
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.height = 10;
        canvas.width = 10;
        const baseCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
        baseCtx.fillStyle = 'white';
        baseCtx.fillRect(0, 0, canvas.width, canvas.height);
        baseCtx.strokeStyle = 'black';
        baseCtx.strokeRect(0, 0, 5, 5);

        // set the position of mouseDown event
        service.mouseDownCoord = { x: 2, y: 2 };

        // set up drawingServiceSpy with mock retrun values for test
        drawingServiceSpy.baseCtx = baseCtx;
        drawingServiceSpy.canvas = canvas;
        drawingServiceSpy.getPixelData.and.returnValue(baseCtx.getImageData(service.mouseDownCoord.x, service.mouseDownCoord.y, 1, 1).data);
        drawingServiceSpy.getCanvasData.and.returnValue(baseCtx.getImageData(0, 0, canvas.width, canvas.height));

        // set rgba primary color to blue
        const rgba: Rgba = {
            RED: 0,
            GREEN: 0,
            BLUE: 255,
            ALPHA: 255,
        };
        colorSelectionServiceSpy.getRgbaPrimaryColor.and.returnValue(rgba);

        // start the test
        service.contiguousFill();

        const currentImageData: ImageData = baseCtx.getImageData(0, 0, canvas.width, canvas.height);
        const expectedImageData: ImageData = baseCtxCompare.getImageData(0, 0, canvasCompare.width, canvasCompare.height);

        expect(currentImageData).toEqual(expectedImageData);
        expect(drawingServiceSpy.autoSave).toHaveBeenCalled();
    });

    it('contiguousFill should only fill inside canvas', () => {
        // create a dummy canvas with a filled rectangle
        const canvasCompare: HTMLCanvasElement = document.createElement('canvas');
        canvasCompare.height = 10;
        canvasCompare.width = 10;
        const baseCtxCompare = canvasCompare.getContext('2d') as CanvasRenderingContext2D;
        baseCtxCompare.fillStyle = 'blue';
        baseCtxCompare.fillRect(0, 0, canvasCompare.width, canvasCompare.height);

        // create a canvas with a rectangle that is not yet filled
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.height = 10;
        canvas.width = 10;
        const baseCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
        baseCtx.fillStyle = 'white';
        baseCtx.fillRect(-10, -10, 20, 20);

        // set the position of mouseDown event
        service.mouseDownCoord = { x: 0, y: 0 };

        // set up drawingServiceSpy with mock retrun values for test
        drawingServiceSpy.baseCtx = baseCtx;
        drawingServiceSpy.canvas = canvas;
        drawingServiceSpy.getPixelData.and.returnValue(baseCtx.getImageData(service.mouseDownCoord.x, service.mouseDownCoord.y, 1, 1).data);
        drawingServiceSpy.getCanvasData.and.returnValue(baseCtx.getImageData(0, 0, canvas.width, canvas.height));

        // set rgba primary color to blue
        const rgba: Rgba = {
            RED: 0,
            GREEN: 0,
            BLUE: 255,
            ALPHA: 255,
        };
        colorSelectionServiceSpy.getRgbaPrimaryColor.and.returnValue(rgba);

        // start the test
        service.contiguousFill();

        const currentImageData: ImageData = baseCtx.getImageData(0, 0, canvas.width, canvas.height);
        const expectedImageData: ImageData = baseCtxCompare.getImageData(0, 0, canvasCompare.width, canvasCompare.height);

        expect(currentImageData).toEqual(expectedImageData);
    });

    it('fill should fill both rectangles on canvas', () => {
        // create a dummy canvas with two filled black rectangles that do not touch
        const canvasCompare: HTMLCanvasElement = document.createElement('canvas');
        canvasCompare.height = 10;
        canvasCompare.width = 10;
        const baseCtxCompare = canvasCompare.getContext('2d') as CanvasRenderingContext2D;
        baseCtxCompare.fillStyle = 'white';
        baseCtxCompare.fillRect(0, 0, canvasCompare.width, canvasCompare.height);
        baseCtxCompare.fillStyle = 'black';
        baseCtxCompare.fillRect(0, 0, 3, 3);
        baseCtxCompare.fillRect(5, 5, 3, 3);

        // create a canvas with two filled blue rectangles that do not touch
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.height = 10;
        canvas.width = 10;
        const baseCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
        baseCtx.fillStyle = 'white';
        baseCtx.fillRect(0, 0, canvas.width, canvas.height);
        baseCtx.fillStyle = 'blue';
        baseCtx.fillRect(0, 0, 3, 3);
        baseCtx.fillRect(5, 5, 3, 3);

        // set the position of mouseDown event
        service.mouseDownCoord = { x: 1, y: 1 };

        // set up drawingServiceSpy with mock retrun values for test
        drawingServiceSpy.baseCtx = baseCtx;
        drawingServiceSpy.canvas = canvas;
        drawingServiceSpy.getPixelData.and.returnValue(baseCtx.getImageData(service.mouseDownCoord.x, service.mouseDownCoord.y, 1, 1).data);
        drawingServiceSpy.getCanvasData.and.returnValue(baseCtx.getImageData(0, 0, canvas.width, canvas.height));

        // set rgba primary color to black
        const rgba: Rgba = {
            RED: 0,
            GREEN: 0,
            BLUE: 0,
            ALPHA: 255,
        };
        colorSelectionServiceSpy.getRgbaPrimaryColor.and.returnValue(rgba);

        // start the test
        service.fill();

        const currentImageData: ImageData = baseCtx.getImageData(0, 0, canvas.width, canvas.height);
        const expectedImageData: ImageData = baseCtxCompare.getImageData(0, 0, canvasCompare.width, canvasCompare.height);

        expect(currentImageData).toEqual(expectedImageData);
    });

    it('Vec2ToString should return Vec2 as string value', () => {
        const vector2D: Vec2 = { x: 1, y: 0 };
        const expectedOutput = '1,0';

        expect(service.Vec2ToString(vector2D)).toBe(expectedOutput);
    });

    it('isInToleranceRange should return true if pixelData is the same as ImageData with tolerance 0', () => {
        const pixelData: Uint8ClampedArray = new Uint8ClampedArray([255, 255, 255, 255]);
        const canvasData: ImageData = { data: new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255]), height: 1, width: 2 };
        const index = 0;

        service.tolerance = 0;

        expect(service.isInToleranceRange(pixelData, canvasData, index)).toBe(true);
    });

    it('isInToleranceRange should return false if pixelData is not the same as ImageData with tolerance 0', () => {
        const pixelData: Uint8ClampedArray = new Uint8ClampedArray([255, 255, 255, 255]);
        const canvasData: ImageData = { data: new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255]), height: 1, width: 2 };
        const index = 4;

        service.tolerance = 0;

        expect(service.isInToleranceRange(pixelData, canvasData, index)).toBe(false);
    });

    it('isInToleranceRange should return false if pixelData is not the same as ImageData with tolerance 10 ', () => {
        const pixelData: Uint8ClampedArray = new Uint8ClampedArray([255, 255, 255, 255]);
        const canvasData: ImageData = { data: new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255]), height: 1, width: 2 };
        const index = 4;

        service.tolerance = 10;

        expect(service.isInToleranceRange(pixelData, canvasData, index)).toBe(false);
    });

    it('isInToleranceRange should return true if pixelData is not the same as ImageData with tolerance 10 but data is similar', () => {
        const pixelData: Uint8ClampedArray = new Uint8ClampedArray([255, 255, 255, 255]);
        const canvasData: ImageData = { data: new Uint8ClampedArray([255, 255, 255, 255, 250, 250, 250, 255]), height: 1, width: 2 };
        const index = 4;

        service.tolerance = 10;

        expect(service.isInToleranceRange(pixelData, canvasData, index)).toBe(true);
    });

    it('isInToleranceRange should return true if pixelData is not the same as ImageData with tolerance 100', () => {
        const pixelData: Uint8ClampedArray = new Uint8ClampedArray([255, 255, 255, 255]);
        const canvasData: ImageData = { data: new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 0]), height: 1, width: 2 };
        const index = 4;

        service.tolerance = 100;

        expect(service.isInToleranceRange(pixelData, canvasData, index)).toBe(true);
    });
    // tslint:disable-next-line: max-file-line-count
});
