import { TestBed } from '@angular/core/testing';
import { StraightLine } from '@app/classes/line';
import { Line } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from './line.service';

// tslint:disable: no-any
// tslint:disable: no-magic-numbers
describe('LineService', () => {
    let service: LineService;
    let mouseEvent: MouseEvent;
    let previewCanvasStub: HTMLCanvasElement;
    let gridCanvasStub: HTMLCanvasElement;

    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    const WIDTH = 100;
    const HEIGHT = 100;

    beforeEach(() => {
        const canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        gridCanvasStub = canvas as HTMLCanvasElement;

        const drawCanvas = document.createElement('canvas');
        drawCanvas.width = WIDTH;
        drawCanvas.height = HEIGHT;

        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'updateStack', 'setIsToolInUse', 'autoSave']);
        baseCtxStub = canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCanvasStub = canvas as HTMLCanvasElement;

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });

        service = TestBed.inject(LineService);

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

    it(' should set cursor to crosshair on handleCursorCall with previewLayer correctly loaded', () => {
        drawServiceSpy.gridCanvas.style.cursor = 'none';
        service.setCursor();
        expect(gridCanvasStub.style.cursor).toEqual('crosshair');
    });

    it('should not set isDrawing to true if mouse button is not left on mouse up', () => {
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.RIGHT,
        } as MouseEvent;
        service.isDrawing = false;
        service.onMouseUp(mouseEvent);
        expect(service.isDrawing).toBe(false);
    });

    it('should change line width', () => {
        service.lineWidth = 0;
        service.changeLineWidth(1);
        expect(service.lineWidth).toBe(1);
    });

    it('should change dot width', () => {
        service.dotWidth = 0;
        service.changeDotWidth(1);
        expect(service.dotWidth).toBe(1);
    });

    it('should change junction type', () => {
        service.isDot = false;
        service.changeJunction(true);
        expect(service.isDot).toBe(true);
    });

    it('mouse up should add a click to mouseclicks', () => {
        service.onMouseUp(mouseEvent);
        expect(service.mouseClicks[0].x).toEqual(mouseEvent.offsetX);
        expect(service.mouseClicks[0].y).toEqual(mouseEvent.offsetY);
    });

    it('mouse up should update the number of clicks', () => {
        service.numberOfClicks = 0;
        service.onMouseUp(mouseEvent);
        expect(service.numberOfClicks).toBe(1);
    });

    it('mouse up should set drawing bool to true on single click', () => {
        service.onMouseUp(mouseEvent);
        expect(service.isDrawing).toBe(true);
    });

    it('mouse up should set is drawing to false on double click', () => {
        service.isDrawing = true;
        service.onMouseUp(mouseEvent);
        service.onMouseUp(mouseEvent);
        expect(service.isDrawing).toBe(false);
    });

    it('mouse up should reset the mouse clicks list if double click when not drawing a line', () => {
        service.onMouseUp(mouseEvent);
        service.onMouseUp(mouseEvent);
        expect(service.mouseClicks).toEqual([]);
    });

    it('mouse up should reset the number mouse clicks if double click when not drawing a line', () => {
        service.numberOfClicks = 1;
        service.onMouseUp(mouseEvent);
        service.onMouseUp(mouseEvent);
        expect(service.numberOfClicks).toBe(0);
    });

    it('isShiftKeyDown should be true when shift key is pressed down', () => {
        const event = new KeyboardEvent('keypress', {
            key: 'Shift',
        });
        service.onKeyDown(event);
        expect(service.isShiftKeyDown).toBe(true);
    });

    it('isShiftKeyDown should be false when a different key than shift is pressed down', () => {
        const event = new KeyboardEvent('keypress', {
            key: 'Backspace',
        });
        service.onKeyDown(event);
        expect(service.isShiftKeyDown).toBe(false);
    });

    it('isShiftKeyDown should be false when shift key is released', () => {
        const event = new KeyboardEvent('keypress', {
            key: 'Shift',
        });
        service.onKeyUp(event);
        expect(service.isShiftKeyDown).toBe(false);
    });

    it('last segment of line should be deleted when releasing backspace', () => {
        const deleteLastSegmentSpy = spyOn<any>(service, 'deleteLastSegment');
        const event = new KeyboardEvent('keypress', {
            key: 'Backspace',
        });
        service.numberOfClicks = 2;
        service.onKeyUp(event);
        expect(deleteLastSegmentSpy).toHaveBeenCalled();
    });

    it('last segment of line should not be deleted when releasing backspace if number of clicks < 1', () => {
        const deleteLastSegmentSpy = spyOn<any>(service, 'deleteLastSegment');
        const event = new KeyboardEvent('keypress', {
            key: 'Backspace',
        });
        service.numberOfClicks = 1;
        service.onKeyUp(event);
        expect(deleteLastSegmentSpy).not.toHaveBeenCalled();
    });

    it('line should be deleted when escape key is released', () => {
        const deleteLineSpy = spyOn<any>(service, 'deleteLine');
        const event = new KeyboardEvent('keypress', {
            key: 'Escape',
        });
        service.onKeyUp(event);
        expect(deleteLineSpy).toHaveBeenCalled();
    });

    it('should return false if the two last clicks are different', () => {
        const click1: Vec2 = { x: 10, y: 10 };
        const click2: Vec2 = { x: 11, y: 10 };
        service.mouseClicks.push(click1);
        service.mouseClicks.push(click2);
        service.numberOfClicks = 2;
        const returnValue: boolean = service.checkIfDoubleClick();
        expect(returnValue).toBe(false);
    });

    it('should return true if the two last clicks are the same', () => {
        const click1: Vec2 = { x: 10, y: 10 };
        const click2: Vec2 = { x: 10, y: 10 };
        service.mouseClicks.push(click1);
        service.mouseClicks.push(click2);
        service.numberOfClicks = 2;
        const returnValue: boolean = service.checkIfDoubleClick();
        expect(returnValue).toBe(true);
    });

    it('should remove last storedLine, last mouseClick and decrement numberOfClicks', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');
        const click1: Vec2 = { x: 10, y: 10 };
        const click2: Vec2 = { x: 11, y: 11 };
        const line: StraightLine = { startingPoint: click1, endingPoint: click2 };
        service.storedLines.push(line);
        service.mouseClicks.push(click2);
        service.numberOfClicks = 1;

        service.deleteLastSegment();
        expect(drawLineSpy).toHaveBeenCalled();
        expect(service.storedLines.length).toBe(0);
        expect(service.mouseClicks.length).toBe(0);
        expect(service.numberOfClicks).toBe(0);
    });

    it('should not call drawLine in drawSegment if isDrawing is false', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');
        service.isDrawing = false;
        service.drawSegment();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('should call clearCanvas and drawLine', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');

        service.deleteLastSegment();

        expect(drawLineSpy).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should call drawDots', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');
        const drawDots = spyOn<any>(service, 'drawDots');
        service.isDot = true;

        service.deleteLastSegment();
        expect(drawLineSpy).toHaveBeenCalled();
        expect(drawDots).toHaveBeenCalled();
    });

    it('should set isDrawing to be false', () => {
        service.deleteLine();
        expect(service.isDrawing).toBe(false);
    });

    it('should reset storedLines, mouseClicks and numberOfClicks', () => {
        service.onMouseUp(mouseEvent);
        service.deleteLine();
        expect(service.storedLines).toEqual([]);
        expect(service.mouseClicks).toEqual([]);
        expect(service.numberOfClicks).toEqual(0);
    });

    it('should replace last point with initial point', () => {
        const click1: Vec2 = { x: 20, y: 20 };
        const click2: Vec2 = { x: 25, y: 25 };
        const line: StraightLine = { startingPoint: click1, endingPoint: click2 };
        service.storedLines.push(line);
        service.mouseClicks.push(click1);
        service.mouseClicks.push(click2);

        service.onMouseUp(mouseEvent);
        service.onMouseUp(mouseEvent);

        expect(service.mouseClicks[service.mouseClicks.length - 1]).toEqual(service.mouseClicks[0]);
    });

    it('should call drawFullLine on mouse up', () => {
        const drawFullLineSpy = spyOn<any>(service, 'drawFullLine');
        const click1: Vec2 = { x: 20, y: 20 };
        const click2: Vec2 = { x: 25, y: 25 };
        const line: StraightLine = { startingPoint: click1, endingPoint: click2 };
        service.isDot = true;
        service.storedLines.push(line);
        service.mouseClicks.push(click1);
        service.mouseClicks.push(click2);

        service.onMouseUp(mouseEvent);
        service.onMouseUp(mouseEvent);

        expect(service.mouseClicks[service.mouseClicks.length - 1]).toEqual(service.mouseClicks[0]);
        expect(drawFullLineSpy).toHaveBeenCalled();
    });

    it('should call draw line (to draw a segment)', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');
        const click1: Vec2 = { x: 20, y: 20 };
        service.mouseClicks.push(click1);

        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('should call draw dots (when drawing a segment)', () => {
        const drawDotsSpy = spyOn<any>(service, 'drawDots');
        const drawLineSpy = spyOn<any>(service, 'drawLine');

        const click1: Vec2 = { x: 20, y: 20 };
        service.mouseClicks.push(click1);
        service.isDot = true;
        service.onMouseUp(mouseEvent);

        expect(drawDotsSpy).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
        expect(drawServiceSpy.autoSave).toHaveBeenCalled();
    });

    it('should set isShiftDoubleClick to true when double clicking with shift down', () => {
        service.onMouseUp(mouseEvent);
        service.shiftClick = { x: 25, y: 25 };
        service.onMouseUp(mouseEvent);

        expect(service.isShiftDoubleClick).toBe(true);
    });

    it('stored line should correspond to mouse clicks', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');

        const click1: Vec2 = { x: 20, y: 20 };
        service.mouseClicks.push(click1);
        service.isDot = true;
        service.onMouseUp(mouseEvent);

        expect(service.storedLines[0].startingPoint).toEqual(click1);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('last click in mouseClicks should equal ending coordinates of the line', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');

        const click1: Vec2 = { x: 20, y: 20 };
        service.mouseClicks.push(click1);
        service.isDot = true;
        service.onMouseUp(mouseEvent);

        expect(service.mouseClicks[service.mouseClicks.length - 1]).toEqual(service.storedLines[0].endingPoint);
        expect(drawLineSpy).toHaveBeenCalled();
        expect(drawServiceSpy.autoSave).toHaveBeenCalled();
    });

    it('should change mouse event attribute', () => {
        service.onMouseMove(mouseEvent);
        expect(service.mouseEvent).toEqual(mouseEvent);
    });

    it('should call clear canvas and drawLine', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');
        service.isDrawing = true;
        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('should call drawDots', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');
        const drawDotsSpy = spyOn<any>(service, 'drawDots');
        service.isDrawing = true;
        service.isDot = true;
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
        expect(drawDotsSpy).toHaveBeenCalled();
    });

    it('should not call drawLine if isDrawing is false', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');
        service.isDrawing = false;
        const click1: Vec2 = { x: 20, y: 20 };
        const click2: Vec2 = { x: 25, y: 25 };
        const line: StraightLine = { startingPoint: click1, endingPoint: click2 };
        service.storedLines.push(line);
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('should not call drawLine if isDrawing is false', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');
        service.isDrawing = true;
        const click1: Vec2 = { x: 20, y: 20 };
        const click2: Vec2 = { x: 25, y: 25 };
        const line: StraightLine = { startingPoint: click1, endingPoint: click2 };
        service.storedLines.push(line);
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('should call adjustLineAngle when shift pressed down', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');
        const adjustLineAngleSpy = spyOn<any>(service, 'adjustLineAngle');
        service.isDrawing = true;
        service.isShiftKeyDown = true;
        service.onMouseMove(mouseEvent);
        expect(adjustLineAngleSpy).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('deleteLastSegment should redraw preview line when a segment is deleted', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');
        const click1: Vec2 = { x: 10, y: 10 };
        const click2: Vec2 = { x: 11, y: 11 };
        const line: StraightLine = { startingPoint: click1, endingPoint: click2 };
        service.storedLines.push(line);
        service.storedLines.push(line);

        service.deleteLastSegment();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('endingClickCoordinates should stay the same if double click', () => {
        const click1: Vec2 = { x: 10, y: 10 };
        const click2: Vec2 = { x: 10, y: 10 };
        service.mouseClicks.push(click1);
        service.adjustLineAngle(click2);
        const expectedValue: Vec2 = { x: 10, y: 10 };
        expect(service.endingClickCoordinates).toEqual(expectedValue);
    });

    it('should be a pixel on preview canvas on the line path (5px right on the horizontal) ', () => {
        const click1: Vec2 = { x: 0, y: 0 };
        const click2: Vec2 = { x: 1, y: 0 };
        const line: StraightLine = { startingPoint: click1, endingPoint: click2 };
        service.storedLines.push(line);

        service.drawLine(click1, click2, previewCtxStub, 1);
        // Premier pixel seulement
        const imageData: ImageData = previewCtxStub.getImageData(0, 0, 1, 1);
        expect(imageData.data[0]).toEqual(0); // R
        expect(imageData.data[1]).toEqual(0); // G
        expect(imageData.data[2]).toEqual(0); // B
        expect(imageData.data[3]).not.toEqual(0); // A
    });

    it('should be a pixel on base canvas on the line path (5px right on the horizontal) ', () => {
        const click1: Vec2 = { x: 0, y: 0 };
        const click2: Vec2 = { x: 1, y: 0 };
        const line: StraightLine = { startingPoint: click1, endingPoint: click2 };
        service.storedLines.push(line);

        service.drawLine(click1, click2, baseCtxStub, 1);
        // Premier pixel seulement
        const imageData: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageData.data[0]).toEqual(0); // R
        expect(imageData.data[1]).toEqual(0); // G
        expect(imageData.data[2]).toEqual(0); // B
        expect(imageData.data[3]).not.toEqual(0); // A
    });

    it('should be a pixel on preview canvas in the dot radius ', () => {
        const click1: Vec2 = { x: 0, y: 0 };
        const click2: Vec2 = { x: 5, y: 0 };
        service.mouseClicks.push(click1);
        service.mouseClicks.push(click2);

        service.drawDots(2, previewCtxStub);
        // Premier pixel seulement
        const imageData: ImageData = previewCtxStub.getImageData(5, 1, 1, 1);
        expect(imageData.data[0]).toEqual(0); // R
        expect(imageData.data[1]).toEqual(0); // G
        expect(imageData.data[2]).toEqual(0); // B
        expect(imageData.data[3]).not.toEqual(0); // A
    });

    it('should be a pixel on base canvas in the dot radius ', () => {
        const click1: Vec2 = { x: 0, y: 0 };
        const click2: Vec2 = { x: 5, y: 0 };
        service.mouseClicks.push(click1);
        service.mouseClicks.push(click2);

        service.drawDots(2, baseCtxStub);
        // Premier pixel seulement
        const imageData: ImageData = baseCtxStub.getImageData(5, 1, 1, 1);
        expect(imageData.data[0]).toEqual(0); // R
        expect(imageData.data[1]).toEqual(0); // G
        expect(imageData.data[2]).toEqual(0); // B
        expect(imageData.data[3]).not.toEqual(0); // A
    });

    it('should be a pixel on base canvas in the dot radius', () => {
        const click1: Vec2 = { x: 0, y: 0 };
        const click2: Vec2 = { x: 5, y: 0 };
        const line: StraightLine = { startingPoint: click1, endingPoint: click2 };
        service.storedLines.push(line);

        // isShiftDoubleClick true means that the ending point will be adjusted
        service.isShiftDoubleClick = true;
        service.mouseClicks.push(click1);
        service.mouseClicks.push(click2);

        service.drawDots(2, baseCtxStub);
        // Premier pixel seulement
        const imageData: ImageData = baseCtxStub.getImageData(5, 1, 1, 1);
        expect(imageData.data[0]).toEqual(0); // R
        expect(imageData.data[1]).toEqual(0); // G
        expect(imageData.data[2]).toEqual(0); // B
        expect(imageData.data[3]).not.toEqual(0); // A
    });

    it('last click of mouseClicks should be equal to the second click of the double click', () => {
        const click1: Vec2 = { x: 0, y: 0 };
        const click2: Vec2 = { x: 5, y: 0 };
        const straightLine: StraightLine = { startingPoint: click1, endingPoint: click2 };
        service.storedLines.push(straightLine);

        // isShiftDoubleClick true means that the ending point will be adjusted
        service.isShiftDoubleClick = true;
        service.mouseClicks.push(click1);
        service.mouseClicks.push(click2);

        const lineData: Line = {
            type: 'line',
            lineWidth: 1,
            lineCap: 'round',
            primaryColor: '#000000',
            secondaryColor: '#000000',
            mouseClicks: service.mouseClicks,
            storedLines: service.storedLines,
            isDot: true,
            line: straightLine,
            isShiftDoubleClick: true,
            hasLastPointBeenChaged: true,
            dotWidth: 2,
        };
        service.drawFullLine(baseCtxStub, lineData);
        expect(service.mouseClicks[service.mouseClicks.length - 1]).toEqual(click2);
    });

    it('last click of mouseClicks should be equal to the second click of the double click', () => {
        const click1: Vec2 = { x: 0, y: 0 };
        const click2: Vec2 = { x: 5, y: 0 };
        const straightLine: StraightLine = { startingPoint: click1, endingPoint: click2 };
        service.storedLines.push(straightLine);

        // isShiftDoubleClick true means that the ending point will be adjusted
        service.isShiftDoubleClick = true;
        service.mouseClicks.push(click1);
        service.mouseClicks.push(click2);

        const lineData: Line = {
            type: 'line',
            lineWidth: 1,
            lineCap: 'round',
            primaryColor: '#000000',
            secondaryColor: '#000000',
            mouseClicks: service.mouseClicks,
            storedLines: service.storedLines,
            isDot: true,
            line: straightLine,
            isShiftDoubleClick: true,
            hasLastPointBeenChaged: false,
            dotWidth: 2,
        };
        service.drawFullLine(baseCtxStub, lineData);
        expect(service.mouseClicks[service.mouseClicks.length - 1]).toEqual(click2);
    });

    it('last click of mouseClicks should not be equal to the first click of mouseClicks if last point has not been changed', () => {
        const click1: Vec2 = { x: 0, y: 0 };
        const click2: Vec2 = { x: 5, y: 0 };
        const straightLine: StraightLine = { startingPoint: click1, endingPoint: click2 };
        service.storedLines.push(straightLine);

        // isShiftDoubleClick true means that the ending point will be adjusted
        service.isShiftDoubleClick = true;
        service.mouseClicks.push(click1);
        service.mouseClicks.push(click2);

        const lineData: Line = {
            type: 'line',
            lineWidth: 1,
            lineCap: 'round',
            primaryColor: '#000000',
            secondaryColor: '#000000',
            mouseClicks: service.mouseClicks,
            storedLines: service.storedLines,
            isDot: true,
            line: straightLine,
            isShiftDoubleClick: false,
            hasLastPointBeenChaged: false,
            dotWidth: 2,
        };
        service.drawFullLine(baseCtxStub, lineData);
        expect(service.mouseClicks[service.mouseClicks.length - 1]).not.toEqual(click1);
    });
    // tslint:disable-next-line: max-file-line-count
});
