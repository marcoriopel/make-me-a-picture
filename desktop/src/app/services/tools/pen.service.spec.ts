import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { ANGLE_HALF_TURN, MouseButton, ROTATION_STEP } from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Subject } from 'rxjs';
import { PenService } from './pen.service';

// tslint:disable: no-magic-numbers
// tslint:disable:no-string-literal
// tslint:disable: no-empty
// tslint:disable:no-any
// tslint:disable: max-file-line-count

describe('PenService', () => {
    let service: PenService;
    let angleObservableSpy: jasmine.SpyObj<Subject<number>>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let previewCtxStub: CanvasRenderingContext2D;
    const WIDTH = 100;
    const HEIGHT = 100;

    beforeEach(() => {
        const canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        angleObservableSpy = jasmine.createSpyObj('Subject<number>', ['next']);
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['setIsToolInUse', 'applyPreview', 'clearCanvas', 'autoSave']);
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['beginPath', 'moveTo', 'lineTo', 'stroke']);
        previewCtxStub = canvas.getContext('2d') as CanvasRenderingContext2D;

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(PenService);

        service.angleObservable = angleObservableSpy;
        service['drawingService'].baseCtx = baseCtxSpy;
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change width', () => {
        service.width = 0;
        service.changeWidth(1);
        expect(service.width).toBe(1);
    });

    it('should change angle to newAngle if newAngle < 180', () => {
        const newAngle = 50;
        service.angle = 0;
        service.changeAngle(newAngle);
        expect(service.angle).toBe(newAngle);
    });

    it('should change angle to newAngle % 180 if newAngle > 180', () => {
        const newAngle = 190;
        service.angle = 0;
        service.changeAngle(newAngle);
        expect(service.angle).toBe(10);
    });

    it('should change angle to newAngle + 180 if newAngle < 0', () => {
        const newAngle = -80;
        service.angle = 0;
        service.changeAngle(newAngle);
        expect(service.angle).toBe(100);
    });

    it('should service.angleObservable.next', () => {
        const newAngle = 50;
        service.angle = 0;
        service.changeAngle(newAngle);
        expect(service.angleObservable.next).toHaveBeenCalledWith(newAngle);
    });

    it(' mouseDown should call service.drawPenStroke', () => {
        const drawPenStrokeSpy = spyOn(service, 'drawPenStroke');
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;

        service.onMouseDown(mouseEvent);
        expect(drawPenStrokeSpy).toHaveBeenCalledWith(service['drawingService'].previewCtx);
    });

    it(' mouseDown should set filter of baseCtx and previewCtx to none', () => {
        const drawPenStrokeSpy = spyOn(service, 'drawPenStroke');
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;

        service.onMouseDown(mouseEvent);
        expect(drawPenStrokeSpy).toHaveBeenCalledWith(service['drawingService'].previewCtx);
        expect(service['drawingService'].baseCtx.filter).toEqual('none');
        expect(service['drawingService'].previewCtx.filter).toEqual('none');
    });

    it(' mouseDown should set mouseDown to true', () => {
        const drawPenStrokeSpy = spyOn(service, 'drawPenStroke');
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;

        service.onMouseDown(mouseEvent);
        expect(drawPenStrokeSpy).toHaveBeenCalledWith(service['drawingService'].previewCtx);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set lastPoint and currentPoint to correct position', () => {
        const drawPenStrokeSpy = spyOn(service, 'drawPenStroke');
        const expectedResult: Vec2 = { x: 25, y: 25 };
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;

        service.onMouseDown(mouseEvent);
        expect(drawPenStrokeSpy).toHaveBeenCalledWith(service['drawingService'].previewCtx);
        expect(service.lastPoint).toEqual(expectedResult);
        expect(service.currentPoint).toEqual(expectedResult);
    });

    it(' mouseDown should call drawingService.setIsToolInUse', () => {
        const drawPenStrokeSpy = spyOn(service, 'drawPenStroke');
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;

        service.onMouseDown(mouseEvent);
        expect(drawPenStrokeSpy).toHaveBeenCalledWith(service['drawingService'].previewCtx);
        expect(service['drawingService'].setIsToolInUse).toHaveBeenCalledWith(true);
    });

    it(' mouseDown should not call drawingService.setIsToolInUse if right click', () => {
        const drawPenStrokeSpy = spyOn(service, 'drawPenStroke');
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.RIGHT,
        } as MouseEvent;

        service.onMouseDown(mouseEvent);

        expect(drawPenStrokeSpy).not.toHaveBeenCalled();
        expect(service['drawingService'].setIsToolInUse).not.toHaveBeenCalled();
    });

    it(' mouseUp set mouseDown to false', () => {
        service.mouseDown = true;
        service.onMouseUp({} as MouseEvent);

        expect(service.mouseDown).toBe(false);
        expect(drawServiceSpy.autoSave).toHaveBeenCalled();
    });

    it(' mouseUp should call applyPreview if mouseDown is true', () => {
        service.mouseDown = true;
        service.onMouseUp({} as MouseEvent);

        expect(service['drawingService'].applyPreview).toHaveBeenCalled();
        expect(drawServiceSpy.autoSave).toHaveBeenCalled();
    });

    it(' mouseUp should call clearCanvas if mouseDown is true', () => {
        service.mouseDown = true;
        service.onMouseUp({} as MouseEvent);

        expect(service['drawingService'].clearCanvas).toHaveBeenCalledWith(service['drawingService'].previewCtx);
        expect(drawServiceSpy.autoSave).toHaveBeenCalled();
    });

    it(' mouseUp should call setIsToolInUse if mouseDown is true', () => {
        service.mouseDown = true;
        service.onMouseUp({} as MouseEvent);

        expect(service['drawingService'].setIsToolInUse).toHaveBeenCalledWith(false);
        expect(drawServiceSpy.autoSave).toHaveBeenCalled();
    });

    it(' mouseUp should not call setIsToolInUse if mouseDown is false', () => {
        service.mouseDown = false;
        service.onMouseUp({} as MouseEvent);

        expect(service['drawingService'].applyPreview).not.toHaveBeenCalled();
        expect(service['drawingService'].clearCanvas).not.toHaveBeenCalled();
        expect(service['drawingService'].setIsToolInUse).not.toHaveBeenCalled();
        expect(drawServiceSpy.autoSave).toHaveBeenCalled();
    });

    it(' mouseMove should not call drawPenStroke if mouseDown is false', () => {
        const drawPenStrokeSpy = spyOn(service, 'drawPenStroke');
        service.mouseDown = false;
        service.onMouseMove({} as MouseEvent);

        expect(drawPenStrokeSpy).not.toHaveBeenCalled();
    });

    it(' mouseMove should call drawPenStroke if mouseDown is true', () => {
        const drawPenStrokeSpy = spyOn(service, 'drawPenStroke');
        service.mouseDown = true;
        service.onMouseMove({} as MouseEvent);

        expect(drawPenStrokeSpy).toHaveBeenCalledWith(service['drawingService'].previewCtx);
    });

    it(' mouseMove should set lastPoint to currentPoint if mouseDown is true', () => {
        const drawPenStrokeSpy = spyOn(service, 'drawPenStroke');
        service.mouseDown = true;
        service.lastPoint = { x: 0, y: 0 };
        service.currentPoint = { x: 25, y: 25 };
        service.onMouseMove({} as MouseEvent);

        expect(drawPenStrokeSpy).toHaveBeenCalledWith(service['drawingService'].previewCtx);
        expect(service.lastPoint).toEqual({ x: 25, y: 25 });
    });

    it(' mouseMove should set currentPoint to mouseCoord if mouseDown is true', () => {
        const drawPenStrokeSpy = spyOn(service, 'drawPenStroke');
        service.mouseDown = true;
        service.currentPoint = { x: 25, y: 25 };
        const mouseEvent = {
            offsetX: 15,
            offsetY: 12,
        } as MouseEvent;

        service.onMouseMove(mouseEvent);

        expect(drawPenStrokeSpy).toHaveBeenCalledWith(service['drawingService'].previewCtx);
        expect(service.currentPoint).toEqual({ x: 15, y: 12 });
    });

    it(' onKeyDown should not call event.preventDefault if event.altKey is false and service.altKeyPressed is false', () => {
        const keyEvent = {
            altKey: false,
            preventDefault(): void {},
        } as KeyboardEvent;
        const preventDefaultSpy = spyOn(keyEvent, 'preventDefault');
        service.altKeyPressed = false;

        service.onKeyDown(keyEvent);

        expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it(' onKeyDown should call event.preventDefault if event.altKey is true and service.altKeyPressed is false', () => {
        const keyEvent = {
            altKey: true,
            preventDefault(): void {},
        } as KeyboardEvent;
        const preventDefaultSpy = spyOn(keyEvent, 'preventDefault');
        service.altKeyPressed = false;

        service.onKeyDown(keyEvent);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it(' onKeyDown should set service.altKeyPressed to true if event.altKey is true and service.altKeyPressed is false', () => {
        const keyEvent = {
            altKey: true,
            preventDefault(): void {},
        } as KeyboardEvent;
        service.altKeyPressed = false;

        service.onKeyDown(keyEvent);

        expect(service.altKeyPressed).toEqual(true);
    });

    it(' onKeyUp should set service.altKeyPressed to false if event.Key is Alt', () => {
        const keyEvent = {
            key: 'Alt',
        } as KeyboardEvent;
        service.altKeyPressed = true;

        service.onKeyUp(keyEvent);

        expect(service.altKeyPressed).toEqual(false);
    });

    it(' onKeyUp should leave service.altKeyPressed to true if event.Key is not Alt', () => {
        const keyEvent = {
            key: 'b',
        } as KeyboardEvent;
        service.altKeyPressed = true;

        service.onKeyUp(keyEvent);

        expect(service.altKeyPressed).toEqual(true);
    });

    it(' onWheelEvent should call service.changeAngle with newAngle = service.angle + ROTATION_STEP', () => {
        const changeAngleSpy = spyOn(service, 'changeAngle');
        const wheelEvent = {
            deltaY: 100,
        } as WheelEvent;
        service.altKeyPressed = false;
        service.angle = 0;
        const newAngle = service.angle - ROTATION_STEP;

        service.onWheelEvent(wheelEvent);

        expect(changeAngleSpy).toHaveBeenCalledWith(newAngle);
    });

    it(' onWheelEvent should call service.changeAngle with newAngle = service.angle + 1 if alt key is pressed', () => {
        const changeAngleSpy = spyOn(service, 'changeAngle');
        const wheelEvent = {
            deltaY: 100,
        } as WheelEvent;
        service.altKeyPressed = true;
        service.angle = 0;
        const newAngle = service.angle - 1;

        service.onWheelEvent(wheelEvent);

        expect(changeAngleSpy).toHaveBeenCalledWith(newAngle);
    });

    it(' drawPenStroke should call ctx.beginPath()', () => {
        service.lastPoint = { x: 0, y: 0 };
        service.currentPoint = { x: 2, y: 2 };

        service.drawPenStroke(baseCtxSpy);

        expect(baseCtxSpy.beginPath).toHaveBeenCalled();
    });

    it(' drawPenStroke should call ctx.moveTo()', () => {
        service.lastPoint = { x: 0, y: 0 };
        service.currentPoint = { x: 2, y: 2 };

        service.drawPenStroke(baseCtxSpy);

        expect(baseCtxSpy.moveTo).toHaveBeenCalledWith(service.lastPoint.x, service.lastPoint.y);
    });

    it(' drawPenStroke should call ctx.lineTo()', () => {
        service.lastPoint = { x: 0, y: 0 };
        service.currentPoint = { x: 2, y: 2 };

        service.drawPenStroke(baseCtxSpy);

        expect(baseCtxSpy.lineTo).toHaveBeenCalledWith(service.currentPoint.x, service.currentPoint.y);
    });

    it(' drawPenStroke should call ctx.stroke()', () => {
        service.lastPoint = { x: 0, y: 0 };
        service.currentPoint = { x: 2, y: 2 };

        service.drawPenStroke(baseCtxSpy);

        expect(baseCtxSpy.stroke).toHaveBeenCalled();
    });

    it(' drawPenStroke should set ctx attributes', () => {
        service.colorSelectionService.primaryColor = 'red';
        service.lastPoint = { x: 0, y: 0 };
        service.currentPoint = { x: 2, y: 2 };

        service.drawPenStroke(baseCtxSpy);

        expect(baseCtxSpy.lineWidth).toEqual(2);
        expect(baseCtxSpy.strokeStyle).toEqual('red');
        expect(baseCtxSpy.lineJoin).toEqual('round');
        expect(baseCtxSpy.lineCap).toEqual('round');
    });

    it(' drawPenStroke should call ctx.moveTo() and ctx.lineTo() the correct number of times', () => {
        service.width = 4;
        service.lastPoint = { x: 0, y: 0 };
        service.currentPoint = { x: 2, y: 2 };

        service.drawPenStroke(baseCtxSpy);

        expect(baseCtxSpy.moveTo).toHaveBeenCalledTimes(5);
        expect(baseCtxSpy.lineTo).toHaveBeenCalledTimes(5);
    });

    it(' drawPenStroke should call ctx.moveTo() and ctx.lineTo() with correct parameters', () => {
        service.width = 10;
        service.angle = 36.87;
        service.lastPoint = { x: 0, y: 0 };
        service.currentPoint = { x: 2, y: 2 };

        service.drawPenStroke(baseCtxSpy);

        expect(baseCtxSpy.moveTo).toHaveBeenCalledWith(service.lastPoint.x + 3.0000071456633126, service.lastPoint.y + 3.999994640742543);
        expect(baseCtxSpy.moveTo).toHaveBeenCalledWith(service.lastPoint.x - 3.0000071456633126, service.lastPoint.y - 3.999994640742543);
        expect(baseCtxSpy.lineTo).toHaveBeenCalledWith(service.currentPoint.x + 3.0000071456633126, service.currentPoint.y + 3.999994640742543);
        expect(baseCtxSpy.lineTo).toHaveBeenCalledWith(service.currentPoint.x - 3.0000071456633126, service.currentPoint.y - 3.999994640742543);
    });

    it(' toRadians should return radian value of angle', () => {
        const angle = 15;
        const angleRad = angle * (Math.PI / ANGLE_HALF_TURN);

        expect(service.toRadians(angle)).toEqual(angleRad);
    });
});
