import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from './pencil.service';

// tslint:disable:no-any
describe('PencilService', () => {
    let service: PencilService;
    let mouseEvent: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let gridCanvasStub: HTMLCanvasElement;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let previewCanvasStub: HTMLCanvasElement;
    let drawPencilStrokeSpy: jasmine.Spy<any>;
    const WIDTH = 100;
    const HEIGHT = 100;

    beforeEach(() => {
        const canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        const drawCanvas = document.createElement('canvas');
        drawCanvas.width = WIDTH;
        drawCanvas.height = HEIGHT;
        baseCtxStub = canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'updateStack', 'setIsToolInUse', 'autoSave']);
        previewCanvasStub = canvas as HTMLCanvasElement;
        gridCanvasStub = canvas as HTMLCanvasElement;
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(PencilService);
        drawPencilStrokeSpy = spyOn<any>(service, 'drawPencilStroke').and.callThrough();

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
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

    it(' should draw line on mouseleave', () => {
        service.onMouseLeave();
        expect(drawPencilStrokeSpy).toHaveBeenCalled();
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
        expect(drawPencilStrokeSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseUp(mouseEvent);
        expect(drawPencilStrokeSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawLine if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };
        service.onMouseUp(mouseEvent);
        expect(drawPencilStrokeSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawPencilStrokeSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawPencilStrokeSpy).not.toHaveBeenCalled();
    });

    it(' should set cursor to crosshair on handleCursorCall with previewLayer correctly loaded', () => {
        drawServiceSpy.gridCanvas.style.cursor = 'none';
        service.setCursor();
        expect(gridCanvasStub.style.cursor).toEqual('crosshair');
    });

    it(' should change the pixel of the canvas ', () => {
        mouseEvent = { offsetX: 0, offsetY: 0, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 1, offsetY: 0, button: 0 } as MouseEvent;
        service.onMouseUp(mouseEvent);
        // Premier pixel seulement
        const imageData: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageData.data[0]).toEqual(0); // R
        expect(imageData.data[1]).toEqual(0); // G
        expect(imageData.data[2]).toEqual(0); // B
        // tslint:disable-next-line:no-magic-numbers
        expect(imageData.data[3]).not.toEqual(0); // A
        expect(drawServiceSpy.autoSave).toHaveBeenCalled();
    });

    it(' should get position from mouse', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        expect(service.getPositionFromMouse(mouseEvent)).toEqual(expectedResult);
    });
});
