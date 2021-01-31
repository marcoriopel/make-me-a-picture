import { TestBed } from '@angular/core/testing';
import { SelectionBox } from '@app/classes/selection-box';
import { MAX_ANGLE, ROTATION_STEP, ROTATION_STEP_ALT } from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RotateService } from './rotate.service';
import SpyObj = jasmine.SpyObj;

// tslint:disable: no-magic-numbers
describe('RotateSelectionService', () => {
    let service: RotateService;
    let previewCtxSpy: SpyObj<CanvasRenderingContext2D>;
    let drawingServiceSpy: SpyObj<DrawingService>;
    let mouseWheelEvent: WheelEvent;

    beforeEach(() => {
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['drawImage', 'fillRect', 'save', 'restore', 'translate', 'rotate']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'setIsToolInUse']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(RotateService);

        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        service.selectionImageCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy.previewCtx = previewCtxSpy;
        service.selection = { startingPoint: { x: 0, y: 0 }, width: 1, height: 1 };

        mouseWheelEvent = {
            deltaY: 101,
        } as WheelEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize service', () => {
        const selection: SelectionBox = { startingPoint: { x: 3, y: 3 }, width: 2, height: 1 };
        const selectionImage: HTMLCanvasElement = document.createElement('canvas');
        const selectionImageCtx: CanvasRenderingContext2D = selectionImage.getContext('2d') as CanvasRenderingContext2D;
        service.initialize(selection, selectionImage);

        expect(service.initialSelection).toEqual(selection);
        expect(service.selection).toEqual(selection);
        expect(service.selectionImage).toEqual(selectionImage);
        expect(service.selectionImageCtx).toEqual(selectionImageCtx);
    });

    it('should change angle', () => {
        const angle = 10;
        service.changeAngle(angle);
        expect(service.angle).toEqual(angle);
    });

    it('should set the angle', () => {
        service.angle = 100;
        const delta = (mouseWheelEvent.deltaY / mouseWheelEvent.deltaY) * ROTATION_STEP;
        const newAngle = service.angle + delta;
        service.setAngleRotation(mouseWheelEvent);
        expect(service.angle).toEqual(newAngle);
    });

    it('should set the angle at 0 when over MAX_ANGLE', () => {
        const changeAngleSpy = spyOn(service, 'changeAngle');
        service.angle = MAX_ANGLE;
        service.setAngleRotation(mouseWheelEvent);
        expect(changeAngleSpy).toHaveBeenCalledWith(ROTATION_STEP);
    });

    it('should change attribute onWheelEvent', () => {
        service.onWheelEvent(mouseWheelEvent);
        expect(service.mouseWheel).toEqual(true);
        expect(service.isRotationOver).toEqual(false);
    });

    it('Should restoreSelection and print on the previewCanvas', () => {
        const drawOnPreviewCanvasSpy = spyOn(service, 'drawOnPreviewCanvas');
        service.restoreSelection();
        expect(drawOnPreviewCanvasSpy).toHaveBeenCalled();
        expect(service.isRotationOver).toEqual(true);
        expect(service.angle).toEqual(0);
    });

    it('Should rotate with rotation step of 1 when alt is press', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Alt' });
        service.isAltKeyDown = false;
        service.onKeyDown(keyboardEvent);
        expect(service.isAltKeyDown).toEqual(true);
        expect(service.deltaRotation).toEqual(ROTATION_STEP_ALT);
    });

    it('Should not change deltaRotation when alt is press a long time', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Alt' });
        service.isAltKeyDown = true;
        const deltaRotation = service.deltaRotation;
        service.onKeyDown(keyboardEvent);
        expect(service.isAltKeyDown).toEqual(true);
        expect(service.deltaRotation).toEqual(deltaRotation);
    });

    it('Should return to normal when alt unpress', () => {
        const keyboardEvent = new KeyboardEvent('keyUp', { key: 'Alt' });
        service.isAltKeyDown = true;
        service.onKeyUp(keyboardEvent);
        expect(service.isAltKeyDown).toEqual(false);
        expect(service.deltaRotation).toEqual(ROTATION_STEP);
    });

    it('Should not change anything if alt was not press', () => {
        const keyboardEvent = new KeyboardEvent('keyUp', { key: 'Alt' });
        service.isAltKeyDown = false;
        const deltaRotation = service.deltaRotation;
        service.onKeyUp(keyboardEvent);
        expect(service.isAltKeyDown).toEqual(false);
        expect(service.deltaRotation).toEqual(deltaRotation);
    });

    it('clearSelectionBackground should set selection background to white', () => {
        // create a black dummy canvas
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.height = 10;
        canvas.width = 10;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        service.drawingService.previewCtx = ctx;

        service.selectionImage = canvas;

        service.clearSelectionBackground();

        expect(ctx.getImageData(0, 0, 1, 1).data).toEqual(new Uint8ClampedArray([255, 255, 255, 255]));
    });

    it('printSelectionOnPreview should call drawingService.clearCanvas and clearSelectionBackground', () => {
        const clearSelectionBackgroundSpy = spyOn(service, 'clearSelectionBackground');

        service.drawOnPreviewCanvas();

        expect(clearSelectionBackgroundSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('printSelectionOnPreview should call drawingService.previewCtx.drawImage', () => {
        const clearSelectionBackgroundSpy = spyOn(service, 'clearSelectionBackground');

        service.drawOnPreviewCanvas();

        expect(clearSelectionBackgroundSpy).toHaveBeenCalled();
        expect(previewCtxSpy.save).toHaveBeenCalled();
        expect(previewCtxSpy.drawImage).toHaveBeenCalled();
        expect(previewCtxSpy.restore).toHaveBeenCalled();
    });

    it('printSelectionOnPreview should call rotatePreviewCanvas', () => {
        const rotatePreviewCanvasSpy = spyOn(service, 'rotatePreviewCanvas');

        service.drawOnPreviewCanvas();

        expect(rotatePreviewCanvasSpy).toHaveBeenCalled();
        expect(previewCtxSpy.save).toHaveBeenCalled();
        expect(previewCtxSpy.drawImage).toHaveBeenCalled();
        expect(previewCtxSpy.restore).toHaveBeenCalled();
    });
});
