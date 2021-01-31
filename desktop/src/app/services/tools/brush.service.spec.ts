import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BrushService } from './brush.service';

// tslint:disable:no-any
describe('BrushService', () => {
    let service: BrushService;
    let mouseEvent: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let gridCanvasStub: HTMLCanvasElement;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCanvasStub: HTMLCanvasElement;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawLineSpy: jasmine.Spy<any>;
    const WIDTH = 100;
    const HEIGHT = 100;
    const pattern = 'pattern2';

    beforeEach(() => {
        const canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        const drawCanvas = document.createElement('canvas');
        drawCanvas.width = WIDTH;
        drawCanvas.height = HEIGHT;
        gridCanvasStub = canvas as HTMLCanvasElement;

        previewCanvasStub = canvas as HTMLCanvasElement;
        baseCtxStub = canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'updateStack', 'setIsToolInUse', 'autoSave']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(BrushService);
        drawLineSpy = spyOn<any>(service, 'drawLine').and.callThrough();

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].previewCanvas = previewCanvasStub;
        service['drawingService'].gridCanvas = gridCanvasStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change width', () => {
        service.width = 0;
        service.changeWidth(1);
        expect(service.width).toBe(1);
    });

    it(' should set cursor to crosshair on handleCursorCall with previewLayer correctly loaded', () => {
        drawServiceSpy.gridCanvas.style.cursor = 'none';
        service.setCursor();
        expect(gridCanvasStub.style.cursor).toEqual('crosshair');
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should not draw anything on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.RIGHT,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawLine if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' should change the pixel of the canvas ', () => {
        mouseEvent = { offsetX: 0, offsetY: 0, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 1, offsetY: 0, button: 0 } as MouseEvent;
        service.onMouseUp(mouseEvent);

        const imageData: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageData.data[0]).toEqual(0); // R
        expect(imageData.data[1]).toEqual(0); // G
        expect(imageData.data[2]).toEqual(0); // B
        // tslint:disable-next-line:no-magic-numbers
        expect(imageData.data[3]).not.toEqual(0); // A
    });

    it(' setPattern should change current pattern', () => {
        service.setPattern(pattern);
        expect(service.pattern).toEqual(pattern);
    });

    it(' applyPattern should change filter of layers when called with a valid pattern string', () => {
        service.applyPattern(pattern);
        expect(baseCtxStub.filter).toEqual('url(/assets/patterns.svg#' + pattern + ')');
        expect(previewCtxStub.filter).toEqual('url(/assets/patterns.svg#' + pattern + ')');
    });

    it(' applyPattern should change filter of layers to none when called with a none pattern string', () => {
        service.applyPattern('none');
        expect(baseCtxStub.filter).toEqual('none');
        expect(previewCtxStub.filter).toEqual('none');
    });

    it(' applyPattern should not change filter of layers when called with an invalid pattern string', () => {
        baseCtxStub.filter = 'url(/assets/patterns.svg#' + pattern + ')';
        previewCtxStub.filter = 'url(/assets/patterns.svg#' + pattern + ')';
        service.applyPattern('invalid string');
        expect(previewCtxStub.filter).toEqual('url(/assets/patterns.svg#' + pattern + ')');
        expect(baseCtxStub.filter).toEqual('url(/assets/patterns.svg#' + pattern + ')');
    });

    it(' should draw line on mouseleave', () => {
        service.onMouseLeave();
        expect(drawLineSpy).toHaveBeenCalled();
    });
});
