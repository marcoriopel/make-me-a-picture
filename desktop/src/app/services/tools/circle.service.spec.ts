import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { FILL_STYLES } from '@app/ressources/global-variables/fill-styles';
import { MouseButton } from '@app/ressources/global-variables/global-variables';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { CircleService } from './circle.service';

import SpyObj = jasmine.SpyObj;

// tslint:disable: no-any
// tslint:disable: no-magic-numbers
describe('CircleService', () => {
    let service: CircleService;
    let mouseEvent: MouseEvent;
    let drawServiceSpy: SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let gridCanvasStub: HTMLCanvasElement;

    let previewCtxStub: CanvasRenderingContext2D;
    let previewCanvasStub: HTMLCanvasElement;
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
        service = TestBed.inject(CircleService);
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

    it('should set mousedown to false on init', () => {
        service.mouseDown = true;
        service.initialize();
        expect(service.mouseDown).toEqual(false);
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

    it(' onMouseUp should call drawShape if mouse was already down', () => {
        const drawShapeSpy = spyOn<any>(service, 'drawShape');

        const mouseEventLClick = {
            offsetX: 0,
            offsetY: 0,
            button: MouseButton.LEFT,
        } as MouseEvent;
        service.onMouseDown(mouseEventLClick);
        service.onMouseUp(mouseEvent);
        expect(drawShapeSpy).toHaveBeenCalled();
    });

    it('should call draw ellipse if move with mousedown', () => {
        const drawShapeSpy = spyOn<any>(service, 'drawShape');

        const mouseEventLClick = {
            offsetX: 20,
            offsetY: 20,
            button: MouseButton.LEFT,
        } as MouseEvent;
        service.onMouseDown(mouseEventLClick);
        service.onMouseMove(mouseEvent);
        expect(drawShapeSpy).toHaveBeenCalled();
    });
    it(' should set cursor to crosshair on handleCursorCall with previewLayer correctly loaded', () => {
        drawServiceSpy.gridCanvas.style.cursor = 'none';
        service.setCursor();
        expect(gridCanvasStub.style.cursor).toEqual('crosshair');
    });

    it('should get number from calculation of circleWidth', () => {
        service.firstPoint = { x: 30, y: 30 };
        service.lastPoint = { x: 29, y: 29 };
        service.setCircleHeight();
        service.setCircleWidth();
        expect(service.circleWidth).toEqual(1);
    });

    it('should get number from calculation of circleHeight', () => {
        service.firstPoint = { x: 30, y: 30 };
        service.lastPoint = { x: 25, y: 25 };
        service.setCircleHeight();
        service.setCircleWidth();
        expect(service.circleHeight).toEqual(service.firstPoint.y - service.lastPoint.x);
    });

    it('should call drawCircle if mouse is down and shift is pressed', () => {
        const drawCircleSpy = spyOn<any>(service, 'drawCircle');
        service.ellipseData = {
            type: 'ellipse',
            primaryColor: 'black',
            secondaryColor: 'black',
            center: { x: 0, y: 0 },
            radius: { x: 0, y: 0 },
            fillStyle: 1,
            firstPoint: { x: 0, y: 0 },
            lastPoint: { x: 0, y: 1 },
            isShiftDown: false,
            lineWidth: 1,
        };
        service.isShiftKeyDown = true;
        service.firstPoint = { x: 0, y: 0 };
        service.ellipseCenter = { x: 0, y: 0 };
        service.lastPoint = { x: 0, y: 1 };
        service.drawShape(previewCtxStub);
        expect(drawCircleSpy).toHaveBeenCalled();
    });

    it('should call drawEllipse if mouse is down and shift is unpressed', () => {
        const drawEllipseSpy = spyOn<any>(service, 'drawEllipse');
        service.ellipseData = {
            type: 'ellipse',
            primaryColor: 'black',
            secondaryColor: 'black',
            center: { x: 0, y: 0 },
            radius: { x: 0, y: 0 },
            fillStyle: 1,
            firstPoint: { x: 0, y: 0 },
            lastPoint: { x: 0, y: 1 },
            isShiftDown: false,
            lineWidth: 1,
        };
        service.firstPoint = { x: 0, y: 0 };
        service.ellipseCenter = { x: 0, y: 0 };
        service.lastPoint = { x: 0, y: 1 };
        service.isShiftKeyDown = false;
        service.drawShape(previewCtxStub);
        expect(drawEllipseSpy).toHaveBeenCalled();
    });

    it('should call  drawShape when mouse is down on mousemove', () => {
        const drawShapeSpy = spyOn<any>(service, 'drawShape');
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 26,
            button: MouseButton.LEFT,
        } as MouseEvent;
        service.onMouseDown(mouseEvent);
        service.onMouseMove(mouseEventLClick);
        expect(drawShapeSpy).toHaveBeenCalled();
    });

    it('drawShape should change strokestyle with fillstyle set to fill', () => {
        service.ellipseData = {
            type: 'ellipse',
            primaryColor: 'black',
            secondaryColor: 'black',
            center: { x: 0, y: 0 },
            radius: { x: 0, y: 0 },
            fillStyle: 1,
            firstPoint: { x: 0, y: 0 },
            lastPoint: { x: 0, y: 1 },
            isShiftDown: false,
            lineWidth: 1,
        };
        service.firstPoint = { x: 0, y: 0 };
        service.ellipseCenter = { x: 0, y: 0 };
        service.lastPoint = { x: 0, y: 1 };
        service.isShiftKeyDown = false;
        colorPickerStub.primaryColor = '#ffa500';
        service.fillStyle = FILL_STYLES.FILL;
        service.drawShape(baseCtxStub);
        expect(baseCtxStub.strokeStyle).toEqual(colorPickerStub.primaryColor);
    });

    it('should call fill of drawEllipse if option is not to draw only the border', () => {
        const ctxFillSpy = spyOn<any>(baseCtxStub, 'fill');
        service.fillStyle = FILL_STYLES.FILL;
        service.ellipseData = {
            type: 'ellipse',
            primaryColor: 'black',
            secondaryColor: 'black',
            center: { x: 0, y: 0 },
            radius: { x: 10, y: 10 },
            fillStyle: 1,
            firstPoint: { x: 0, y: 0 },
            lastPoint: { x: 0, y: 1 },
            isShiftDown: false,
            lineWidth: 1,
        };
        service.drawEllipse(baseCtxStub, service.ellipseData);
        expect(ctxFillSpy).toHaveBeenCalled();
    });

    it('should not call fill of ellipse if option is to draw only the border', () => {
        const ctxFillSpy = spyOn<any>(baseCtxStub, 'fill');
        service.fillStyle = FILL_STYLES.BORDER;
        service.ellipseData = {
            type: 'ellipse',
            primaryColor: 'black',
            secondaryColor: 'black',
            center: { x: 0, y: 0 },
            radius: { x: 0, y: 0 },
            fillStyle: 2,
            firstPoint: { x: 0, y: 0 },
            lastPoint: { x: 0, y: 1 },
            isShiftDown: false,
            lineWidth: 1,
        };

        service.drawEllipse(baseCtxStub, service.ellipseData);
        expect(ctxFillSpy).not.toHaveBeenCalled();
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
        const drawShapeSpy = spyOn<any>(service, 'drawShape');
        service.isShiftKeyDown = true;
        const event = new KeyboardEvent('keypress', {
            key: 'Shift',
        });
        service.mouseDown = false;
        service.onKeyUp(event);
        expect(drawShapeSpy).not.toHaveBeenCalled();
    });

    it('should not draw anything on detection of mouse up if it was not down', () => {
        const drawShapeSpy = spyOn<any>(service, 'drawShape');
        service.mouseDown = false;
        service.onMouseUp(mouseEvent);
        expect(drawShapeSpy).not.toHaveBeenCalled();
        expect(drawServiceSpy.autoSave).toHaveBeenCalled();
    });

    it('should not draw anything on detection of mouse move if it was not down', () => {
        const drawShapeSpy = spyOn<any>(service, 'drawShape');
        service.mouseDown = false;
        service.onMouseMove(mouseEvent);
        expect(drawShapeSpy).not.toHaveBeenCalled();
    });

    it('should call fill of circle if style is not set to border', () => {
        const ctxFillSpy = spyOn<any>(baseCtxStub, 'fill');
        service.fillStyle = FILL_STYLES.FILL;
        service.firstPoint = { x: 0, y: 0 };
        service.ellipseCenter = { x: 0, y: 0 };
        service.lastPoint = { x: 10, y: 11 };
        service.ellipseData = {
            type: 'ellipse',
            primaryColor: 'black',
            secondaryColor: 'black',
            center: { x: 0, y: 0 },
            radius: { x: 0, y: 0 },
            fillStyle: 1,
            firstPoint: { x: 0, y: 0 },
            lastPoint: { x: 0, y: 1 },
            isShiftDown: false,
            lineWidth: 1,
        };

        service.drawCircle(baseCtxStub, { x: 0, y: 0 });
        expect(ctxFillSpy).toHaveBeenCalled();
    });

    it('should call fill of circle if if last point is top left', () => {
        const ctxFillSpy = spyOn<any>(baseCtxStub, 'fill');
        service.fillStyle = FILL_STYLES.FILL;
        service.firstPoint = { x: 10, y: 10 };
        service.ellipseCenter = { x: 0, y: 0 };
        service.lastPoint = { x: 0, y: 0 };
        service.ellipseData = {
            type: 'ellipse',
            primaryColor: 'black',
            secondaryColor: 'black',
            center: { x: 0, y: 0 },
            radius: { x: 0, y: 0 },
            fillStyle: 1,
            firstPoint: { x: 1, y: 1 },
            lastPoint: { x: 0, y: 0 },
            isShiftDown: false,
            lineWidth: 1,
        };

        service.drawCircle(baseCtxStub, { x: 0, y: 0 });
        expect(ctxFillSpy).toHaveBeenCalled();
    });

    it('should call fill of circle if if last point is top right', () => {
        const ctxFillSpy = spyOn<any>(baseCtxStub, 'fill');
        service.fillStyle = FILL_STYLES.FILL;
        service.firstPoint = { x: 0, y: 10 };
        service.ellipseCenter = { x: 0, y: 0 };
        service.lastPoint = { x: 10, y: 0 };
        service.ellipseData = {
            type: 'ellipse',
            primaryColor: 'black',
            secondaryColor: 'black',
            center: { x: 0, y: 0 },
            radius: { x: 10, y: 10 },
            fillStyle: 1,
            firstPoint: { x: 0, y: 1 },
            lastPoint: { x: 1, y: 0 },
            isShiftDown: false,
            lineWidth: 1,
        };

        service.drawCircle(baseCtxStub, { x: 0, y: 0 });
        expect(ctxFillSpy).toHaveBeenCalled();
    });

    it('should not call fill of circle if style is set to border', () => {
        const ctxFillSpy = spyOn<any>(baseCtxStub, 'fill');
        service.isShiftKeyDown = true;
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 26,
            button: MouseButton.LEFT,
        } as MouseEvent;
        service.fillStyle = FILL_STYLES.BORDER;
        service.onMouseDown(mouseEvent);
        service.onMouseUp(mouseEventLClick);
        expect(ctxFillSpy).not.toHaveBeenCalled();
        expect(drawServiceSpy.autoSave).toHaveBeenCalled();
    });

    it('drawCircle should not call fill if the fill style is set to border', () => {
        const ctxFillSpy = spyOn<any>(baseCtxStub, 'fill');
        const setCircleWidthSpy = spyOn<any>(service, 'setCircleWidth');
        const setCircleHeigthSpy = spyOn<any>(service, 'setCircleHeight');
        const point: Vec2 = { x: 0, y: 0 };
        service.fillStyle = FILL_STYLES.BORDER;
        service.firstPoint = { x: 30, y: 30 };
        service.lastPoint = { x: 29, y: 31 };
        service.drawCircle(baseCtxStub, point);
        expect(setCircleHeigthSpy).toHaveBeenCalled();
        expect(setCircleWidthSpy).toHaveBeenCalled();
        expect(ctxFillSpy).not.toHaveBeenCalled();
    });

    it('should drawShape if mouse is down and shift ispressed on keydown', () => {
        const drawShapeSpy = spyOn<any>(service, 'drawShape');
        service.isShiftKeyDown = true;
        const event = new KeyboardEvent('keypress', {
            key: 'Shift',
        });
        service.mouseDown = true;
        service.onKeyDown(event);
        expect(drawShapeSpy).toHaveBeenCalled();
    });

    it('should drawShape if mouse is down and shift ispressed on keyUp', () => {
        const drawShapeSpy = spyOn<any>(service, 'drawShape');
        service.isShiftKeyDown = true;
        const event = new KeyboardEvent('keypress', {
            key: 'Shift',
        });
        service.mouseDown = true;
        service.onKeyUp(event);
        expect(drawShapeSpy).toHaveBeenCalled();
    });
    // tslint:disable-next-line: max-file-line-count
});
