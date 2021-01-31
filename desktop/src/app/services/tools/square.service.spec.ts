import { TestBed } from '@angular/core/testing';
import { Rectangle } from '@app/classes/tool-properties';
import { FILL_STYLES } from '@app/ressources/global-variables/fill-styles';
import { MouseButton } from '@app/ressources/global-variables/global-variables';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SquareService } from './square.service';

// tslint:disable: no-any
// tslint:disable: no-magic-numbers
describe('SquareService', () => {
    let service: SquareService;
    let mouseEvent: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let drawShapeSpy: jasmine.Spy<any>;
    let baseCtxStub: CanvasRenderingContext2D;
    let gridCanvasStub: HTMLCanvasElement;

    let previewCtxStub: CanvasRenderingContext2D;
    let previewCanvasStub: HTMLCanvasElement;
    let ctxFillSpy: jasmine.Spy<any>;
    let colorPickerStub: ColorSelectionService;
    const WIDTH = 100;
    const HEIGHT = 100;

    beforeEach(() => {
        const canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        const drawCanvas = document.createElement('canvas');
        drawCanvas.width = WIDTH;
        drawCanvas.height = HEIGHT;
        gridCanvasStub = canvas as HTMLCanvasElement;

        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'updateStack', 'setIsToolInUse', 'autoSave']);
        baseCtxStub = canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCanvasStub = canvas as HTMLCanvasElement;
        colorPickerStub = new ColorSelectionService();

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorSelectionService, useValue: colorPickerStub },
            ],
        });
        service = TestBed.inject(SquareService);

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

    it('should change line width', () => {
        service.width = 0;
        service.changeWidth(1);
        expect(service.width).toBe(1);
    });

    it('should change preview ctx lineJoin to witer on init', () => {
        drawServiceSpy.previewCtx.lineJoin = 'round';
        service.initialize();
        expect(drawServiceSpy.previewCtx.lineJoin).toEqual('miter');
    });

    it('should change the fillStyle', () => {
        service.fillStyle = FILL_STYLES.FILL;
        service.changeFillStyle(FILL_STYLES.BORDER);
        expect(service.fillStyle).toBe(FILL_STYLES.BORDER);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.RIGHT,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it('isShiftKeyDown should be true when shift key is pressed down', () => {
        const event = new KeyboardEvent('keypress', {
            key: 'Shift',
        });
        service.onKeyDown(event);
        expect(service.isShiftKeyDown).toBe(true);
    });

    it('isShiftKeyDown should be false when shift key is released', () => {
        const event = new KeyboardEvent('keypress', {
            key: 'Shift',
        });
        service.onKeyUp(event);
        expect(service.isShiftKeyDown).toBe(false);
    });

    it('onMouseUp should call drawShape if mouse was already down', () => {
        drawShapeSpy = spyOn<any>(service, 'drawShape');

        const mouseEventLClick = {
            offsetX: 20,
            offsetY: 20,
            button: MouseButton.LEFT,
        } as MouseEvent;
        service.onMouseDown(mouseEventLClick);
        service.onMouseUp(mouseEvent);
        expect(drawShapeSpy).toHaveBeenCalled();
    });

    it(' should set cursor to crosshair on handleCursorCall with previewLayer correctly loaded', () => {
        drawServiceSpy.gridCanvas.style.cursor = 'none';
        service.setCursor();
        expect(gridCanvasStub.style.cursor).toEqual('crosshair');
    });

    it('should get number from calculation of rectangleWidth', () => {
        service.firstPoint = { x: 30, y: 30 };
        service.lastPoint = { x: 29, y: 29 };
        service.setRectangleHeight();
        service.setRectangleWidth();
        expect(service.rectangleWidth).toEqual(1);
    });

    it('should get number from calculation of rectangleHeight', () => {
        service.firstPoint = { x: 30, y: 30 };
        service.lastPoint = { x: 25, y: 25 };
        service.setRectangleHeight();
        service.setRectangleWidth();
        expect(service.rectangleHeight).toEqual(service.firstPoint.y - service.lastPoint.x);
    });

    it('should call drawshape if mouse is down and shift is unpressed', () => {
        drawShapeSpy = spyOn<any>(service, 'drawShape');
        service.onMouseDown(mouseEvent);
        service.isShiftKeyDown = true;
        const event = new KeyboardEvent('keypress', {
            key: 'Shift',
        });
        service.onKeyUp(event);
        expect(drawShapeSpy).toHaveBeenCalled();
    });

    it('should drawShape when mouse is down on mousemove', () => {
        drawShapeSpy = spyOn<any>(service, 'drawShape');
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 26,
            button: MouseButton.LEFT,
        } as MouseEvent;
        service.onMouseDown(mouseEvent);
        service.onMouseMove(mouseEventLClick);
        expect(drawShapeSpy).toHaveBeenCalled();
    });

    it('should drawShape ', () => {
        service.firstPoint = { x: 30, y: 30 };
        service.lastPoint = { x: 25, y: 25 };
        const shape = service.drawShape(drawServiceSpy.baseCtx);
        expect(shape).toEqual({ startingPoint: { x: 25.5, y: 25.5 }, width: 5, height: 5 });
    });

    it('should not clear canvas if drawshape is on preview', () => {
        service.firstPoint = { x: 30, y: 30 };
        service.lastPoint = { x: 25, y: 25 };
        const shape = service.drawShape(drawServiceSpy.previewCtx);
        expect(shape).toEqual({ startingPoint: { x: 25.5, y: 25.5 }, width: 5, height: 5 });
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it('should set square attributes if shift is down on drawshape ', () => {
        const squareAttributesSpy = spyOn(service, 'setSquareAttributes');
        service.isShiftKeyDown = true;
        service.firstPoint = { x: 30, y: 30 };
        service.topLeftPoint = { x: 25, y: 25 };
        service.lastPoint = { x: 25, y: 25 };
        const shape = service.drawShape(drawServiceSpy.baseCtx);
        expect(shape).toEqual({ startingPoint: { x: 25.5, y: 25.5 }, width: 5, height: 5 });
        expect(squareAttributesSpy).toHaveBeenCalled();
    });

    it('should finTopLeftPoint if firstPoint is top left corner', () => {
        // Top left is first point
        service.rectangleHeight = 1;
        service.rectangleWidth = 1;
        service.firstPoint = { x: 1, y: 1 };
        service.topLeftPoint = { x: 0, y: 0 };
        service.lastPoint = { x: 2, y: 2 };
        service.setSquareAttributes();
        const topLeft = { x: 1, y: 1 };
        expect(service.topLeftPoint).toEqual(topLeft);
    });

    it('should finTopLeftPoint if firstPoint is top right corner', () => {
        // top left is left by width of first point
        service.rectangleHeight = 1;
        service.rectangleWidth = 1;
        service.topLeftPoint = { x: 0, y: 0 };
        service.firstPoint = { x: 2, y: 2 };
        service.lastPoint = { x: 1, y: 3 };
        service.setSquareAttributes();
        const expectedValue = { x: 1, y: 2 };
        expect(service.topLeftPoint).toEqual(expectedValue);
    });

    it('should finTopLeftPoint if firstPoint is bottom left corner', () => {
        // top left is up by heigth of first point
        service.rectangleHeight = 1;
        service.rectangleWidth = 1;
        service.topLeftPoint = { x: 0, y: 0 };
        service.firstPoint = { x: 1, y: 2 };
        service.lastPoint = { x: 2, y: 1 };
        service.setSquareAttributes();
        const expectedValue = { x: 1, y: 1 };
        expect(service.topLeftPoint).toEqual(expectedValue);
    });

    it('should finTopLeftPoint if firstPoint is bottom right corner', () => {
        // top left is last point
        service.rectangleHeight = 1;
        service.rectangleWidth = 1;
        service.topLeftPoint = { x: 0, y: 0 };
        service.firstPoint = { x: 3, y: 3 };
        service.lastPoint = { x: 2, y: 2 };
        service.setSquareAttributes();
        const expectedValue = { x: 2, y: 2 };
        expect(service.topLeftPoint).toEqual(expectedValue);
    });

    it('should not set isShiftKeyDown to true if key down of anything else than shift', () => {
        service.isShiftKeyDown = false;
        const event = new KeyboardEvent('keypress', {
            key: 'Ctrl',
        });
        service.onKeyDown(event);
        expect(service.isShiftKeyDown).toEqual(false);
    });

    it('should not draw anything if key up of shift but not mousedown', () => {
        drawShapeSpy = spyOn<any>(service, 'drawShape');
        service.isShiftKeyDown = true;
        const event = new KeyboardEvent('keypress', {
            key: 'Shift',
        });
        service.mouseDown = false;
        service.onKeyUp(event);
        expect(drawShapeSpy).not.toHaveBeenCalled();
    });

    it('should not draw anything on detection of mouse up if it was not down', () => {
        drawShapeSpy = spyOn<any>(service, 'drawShape');
        service.mouseDown = false;
        service.onMouseUp(mouseEvent);
        expect(drawShapeSpy).not.toHaveBeenCalled();
    });

    it('should not draw anything on detection of mouse move if it was not down', () => {
        drawShapeSpy = spyOn<any>(service, 'drawShape');
        service.mouseDown = false;
        service.onMouseMove(mouseEvent);
        expect(drawShapeSpy).not.toHaveBeenCalled();
    });

    it('should fill square if style is not set to border', () => {
        ctxFillSpy = spyOn<any>(baseCtxStub, 'fillRect');
        const rectangleData: Rectangle = {
            type: 'rectangle',
            primaryColor: 'red',
            secondaryColor: 'blue',
            height: 10,
            width: 10,
            topLeftPoint: { x: 0, y: 0 },
            fillStyle: FILL_STYLES.FILL,
            isShiftDown: false,
            lineWidth: 1,
        };
        service.drawRectangle(baseCtxStub, rectangleData);
        expect(ctxFillSpy).toHaveBeenCalled();
    });

    it('should not fill square if style is set to border', () => {
        ctxFillSpy = spyOn<any>(baseCtxStub, 'fillRect');
        const rectangleData: Rectangle = {
            type: 'rectangle',
            primaryColor: 'red',
            secondaryColor: 'blue',
            height: 10,
            width: 10,
            topLeftPoint: { x: 0, y: 0 },
            fillStyle: FILL_STYLES.BORDER,
            isShiftDown: false,
            lineWidth: 1,
        };
        service.drawRectangle(baseCtxStub, rectangleData);
        expect(ctxFillSpy).not.toHaveBeenCalled();
    });

    it('should call drawShape if mouseDown is true', () => {
        drawShapeSpy = spyOn<any>(service, 'drawShape');
        const event = new KeyboardEvent('keypress', {
            key: 'Shift',
        });
        service.mouseDown = true;
        service.onKeyDown(event);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawShapeSpy).toHaveBeenCalled();
    });
});
