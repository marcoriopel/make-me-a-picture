import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SelectionBox } from '@app/classes/selection-box';
import { ARROW_KEYS } from '@app/ressources/global-variables/arrow-keys';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MoveService } from './move.service';
import { RotateService } from './rotate.service';
import SpyObj = jasmine.SpyObj;

// tslint:disable: no-magic-numbers
// tslint:disable: max-file-line-count
// tslint:disable: no-string-literal
// tslint:disable: no-empty

describe('MoveService', () => {
    let service: MoveService;
    let drawingServiceSpy: SpyObj<DrawingService>;
    let previewCtxSpy: SpyObj<CanvasRenderingContext2D>;
    let rotateServiceSpy: SpyObj<RotateService>;

    beforeEach(() => {
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['putImageData', 'drawImage', 'fillRect', 'save', 'restore']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'setIsToolInUse']);
        rotateServiceSpy = jasmine.createSpyObj('RotateService', ['rotatePreviewCanvas']);
        drawingServiceSpy.previewCtx = previewCtxSpy;

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: RotateService, useValue: rotateServiceSpy },
            ],
        });
        service = TestBed.inject(MoveService);

        service.selection = { startingPoint: { x: 0, y: 0 }, width: 1, height: 1 };

        service.pressedKeys.set(ARROW_KEYS.LEFT, false);
        service.pressedKeys.set(ARROW_KEYS.UP, false);
        service.pressedKeys.set(ARROW_KEYS.RIGHT, false);
        service.pressedKeys.set(ARROW_KEYS.DOWN, false);

        service.intervalId = undefined;
    });

    afterEach(() => {
        if (service.intervalId) {
            clearInterval(service.intervalId);
        }
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize service', () => {
        const selection: SelectionBox = { startingPoint: { x: 3, y: 3 }, width: 2, height: 1 };
        const selectionImage: HTMLCanvasElement = document.createElement('canvas');
        service.initialize(selection, selectionImage);

        expect(service.initialSelection).toEqual(selection);
        expect(service.selection).toEqual(selection);
        expect(service.selectionImage).toEqual(selectionImage);
    });

    it('onMouseDown should set isTransformationOver to false', () => {
        service.isTransformationOver = true;

        service.onMouseDown({} as MouseEvent);

        expect(service.isTransformationOver).toBe(false);
    });

    it('onMouseMove should call printSelectionOnPreview', () => {
        service.isTransformationOver = true;
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');

        service.onMouseMove(1, 1);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
    });

    it('onMouseMove should set selection.startingPoint', () => {
        service.isTransformationOver = true;
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');

        service.onMouseMove(1, 1);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint).toEqual({ x: 1, y: 1 });
    });

    it('onKeyDown should not call printSelectionOnPreview if key is not arrowKey', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');

        service.onKeyDown({ key: 't' } as KeyboardEvent, false, 5);

        expect(printSelectionOnPreviewSpy).not.toHaveBeenCalled();
    });

    it('onKeyDown should call setTimeout', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        const setTimeoutSpy = spyOn(global, 'setTimeout');

        service.onKeyDown({ key: 't' } as KeyboardEvent, false, 5);

        expect(printSelectionOnPreviewSpy).not.toHaveBeenCalled();
        expect(setTimeoutSpy).toHaveBeenCalled();
    });

    it('onKeyDown should not call setInterval if isArrowKeyPressed is false', fakeAsync(() => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        const setIntervalSpy = spyOn(global, 'setInterval');

        service.onKeyDown({ key: 't' } as KeyboardEvent, false, 5);

        tick(501);

        expect(printSelectionOnPreviewSpy).not.toHaveBeenCalled();
        expect(setIntervalSpy).not.toHaveBeenCalled();
    }));

    it('onKeyDown should not call setInterval if intervalID is not undefined', fakeAsync(() => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        const setIntervalSpy = spyOn(global, 'setInterval');
        // tslint:disable-next-line: no-empty
        service.intervalId = setTimeout(() => {}, 100);
        service.pressedKeys.set(ARROW_KEYS.LEFT, true);

        service.onKeyDown({ key: 't' } as KeyboardEvent, false, 5);

        tick(501);

        expect(printSelectionOnPreviewSpy).not.toHaveBeenCalled();
        expect(setIntervalSpy).not.toHaveBeenCalled();
    }));

    it('onKeyDown should call setInterval if intervalID is undefined and isArrowKeyPressed', fakeAsync(() => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');

        service.pressedKeys.set(ARROW_KEYS.LEFT, true);

        service.onKeyDown({ key: 't' } as KeyboardEvent, false, 5);

        tick(501);

        expect(printSelectionOnPreviewSpy).not.toHaveBeenCalled();
        expect(service.intervalId).toBeDefined();
        // tslint:disable-next-line: no-non-null-assertion
        clearInterval(service.intervalId!);
    }));

    it('onKeyDown should printSelectionOnPreview if key is ArrowKey', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        // tslint:disable-next-line: no-empty
        service.intervalId = setTimeout(() => {}, 100);
        service.pressedKeys.set(ARROW_KEYS.LEFT, true);

        service.onKeyDown({ key: 'ArrowUp' } as KeyboardEvent, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
    });

    it('onKeyDown should set isTransformationOver to false', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        // tslint:disable-next-line: no-empty
        service.intervalId = setTimeout(() => {}, 100);
        service.pressedKeys.set(ARROW_KEYS.LEFT, true);

        service.onKeyDown({ key: 'ArrowUp' } as KeyboardEvent, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.isTransformationOver).toBeFalse();
    });

    it('onKeyDown should change selection.startingPoint.x if key is ArrowLeft', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        service.intervalId = setTimeout(() => {}, 100);
        const initialXValue = service.selection.startingPoint.x;

        service.onKeyDown({ key: 'ArrowLeft' } as KeyboardEvent, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint.x).toBe(initialXValue - 3);
    });

    it('onKeyDown should change selection.startingPoint.x of square size if key is ArrowLeft and there is magnetism', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        service.intervalId = setTimeout(() => {}, 100);
        const initialXValue = service.selection.startingPoint.x;

        service.onKeyDown({ key: 'ArrowLeft' } as KeyboardEvent, true, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint.x).toBe(initialXValue - 5);
    });

    it('onKeyDown should not change selection.startingPoint.x if key is ArrowLeft and ArrowLeft is pressed', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        service.intervalId = setTimeout(() => {}, 100);
        const initialXValue = service.selection.startingPoint.x;
        service.pressedKeys.set(ARROW_KEYS.LEFT, true);

        service.onKeyDown({ key: 'ArrowLeft' } as KeyboardEvent, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint.x).toBe(initialXValue);
    });

    it('onKeyDown should change selection.startingPoint.x if key is ArrowRight', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        service.intervalId = setTimeout(() => {}, 100);
        const initialXValue = service.selection.startingPoint.x;

        service.onKeyDown({ key: 'ArrowRight' } as KeyboardEvent, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint.x).toBe(initialXValue + 3);
    });

    it('onKeyDown should not change selection.startingPoint.x if key is ArrowRight and ArrowRight is pressed', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        service.intervalId = setTimeout(() => {}, 100);
        const initialXValue = service.selection.startingPoint.x;
        service.pressedKeys.set(ARROW_KEYS.RIGHT, true);

        service.onKeyDown({ key: 'ArrowRight' } as KeyboardEvent, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint.x).toBe(initialXValue);
    });

    it('onKeyDown should change selection.startingPoint.y if key is ArrowUp', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        service.intervalId = setTimeout(() => {}, 100);
        const initialYValue = service.selection.startingPoint.y;

        service.onKeyDown({ key: 'ArrowUp' } as KeyboardEvent, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint.y).toBe(initialYValue - 3);
    });

    it('onKeyDown should not change selection.startingPoint.x if key is ArrowUp and ArrowUp is pressed', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        service.intervalId = setTimeout(() => {}, 100);
        const initialXValue = service.selection.startingPoint.x;
        service.pressedKeys.set(ARROW_KEYS.UP, true);

        service.onKeyDown({ key: 'ArrowUp' } as KeyboardEvent, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint.x).toBe(initialXValue);
    });

    it('onKeyDown should change selection.startingPoint.y if key is ArrowDown', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        service.intervalId = setTimeout(() => {}, 100);
        const initialYValue = service.selection.startingPoint.y;

        service.onKeyDown({ key: 'ArrowDown' } as KeyboardEvent, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint.y).toBe(initialYValue + 3);
    });

    it('onKeyDown should not change selection.startingPoint.x if key is ArrowDown and ArrowDown is pressed', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        service.intervalId = setTimeout(() => {}, 100);
        const initialXValue = service.selection.startingPoint.x;
        service.pressedKeys.set(ARROW_KEYS.DOWN, true);

        service.onKeyDown({ key: 'ArrowDown' } as KeyboardEvent, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint.x).toBe(initialXValue);
    });

    it('onKeyUp should not clear interval if interval if isArrowKeyPressed', () => {
        service.intervalId = setTimeout(() => {}, 100);
        const clearIntervalSpy = spyOn(global, 'clearInterval');
        service.pressedKeys.set(ARROW_KEYS.LEFT, true);

        service.onKeyUp({ key: 'ArrowRight' } as KeyboardEvent);

        expect(clearIntervalSpy).not.toHaveBeenCalled();
    });

    it('onKeyUp should not clear interval if interval is undefined', () => {
        const clearIntervalSpy = spyOn(global, 'clearInterval');

        service.onKeyUp({ key: 't' } as KeyboardEvent);

        expect(clearIntervalSpy).not.toHaveBeenCalled();
    });

    it('onKeyUp should clear interval if interval is not undefined and if none of the keys are pressed', () => {
        service.intervalId = setTimeout(() => {}, 100);
        const clearIntervalSpy = spyOn(global, 'clearInterval');

        service.onKeyUp({ key: 't' } as KeyboardEvent);

        expect(clearIntervalSpy).toHaveBeenCalled();
        expect(service.intervalId).toBe((undefined as unknown) as NodeJS.Timeout);
    });

    it('onKeyUp should set pressedKeys ARROW_KEYS.LEFT to false if previously true', () => {
        service.intervalId = setTimeout(() => {}, 100);
        service.pressedKeys.set(ARROW_KEYS.LEFT, true);

        service.onKeyUp({ key: 'ArrowLeft' } as KeyboardEvent);

        expect(service.pressedKeys.get(ARROW_KEYS.LEFT)).toBe(false);
    });

    it('clearSelectionBackground should reset set drawingService.previewCtx.fillStyle to original value', () => {
        service.drawingService.previewCtx.fillStyle = 'black';
        service.clearSelectionBackground();

        expect(previewCtxSpy.fillStyle).toEqual('black');
    });

    it('clearSelectionBackground should call drawingService.previewCtx.fillRect', () => {
        service.clearSelectionBackground();

        expect(previewCtxSpy.fillRect).toHaveBeenCalledWith(
            service.initialSelection.startingPoint.x,
            service.initialSelection.startingPoint.y,
            service.initialSelection.width,
            service.initialSelection.height,
        );
    });

    it('clearSelectionBackground should call drawingService.previewCtx.drawImage', () => {
        service.clearSelectionBackground();

        expect(previewCtxSpy.drawImage).toHaveBeenCalled();
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

        service.printSelectionOnPreview();

        expect(clearSelectionBackgroundSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('printSelectionOnPreview should call drawingService.previewCtx.drawImage', () => {
        const clearSelectionBackgroundSpy = spyOn(service, 'clearSelectionBackground');

        service.printSelectionOnPreview();

        expect(clearSelectionBackgroundSpy).toHaveBeenCalled();
        expect(previewCtxSpy.drawImage).toHaveBeenCalled();
    });

    it('move should call printSelectionOnPreview', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');

        service['move'](service, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
    });

    it('move should not change startingPoint if no keys are pressed', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        const initialStartingPoint = service.selection.startingPoint;

        service['move'](service, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint).toEqual(initialStartingPoint);
    });

    it('move should change startingPoint.x if isArrowKeyLeftPressed', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        service.pressedKeys.set(ARROW_KEYS.LEFT, true);
        const initialXValue = service.selection.startingPoint.x;

        service['move'](service, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint.x).toEqual(initialXValue - 3);
    });

    it('move should change startingPoint.x of square size if isArrowKeyLeftPressed and there is magnetism', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        service.pressedKeys.set(ARROW_KEYS.LEFT, true);
        const initialXValue = service.selection.startingPoint.x;

        service['move'](service, true, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint.x).toEqual(initialXValue - 5);
    });

    it('move should change startingPoint.x if isArrowKeyRightPressed', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        service.pressedKeys.set(ARROW_KEYS.RIGHT, true);
        const initialXValue = service.selection.startingPoint.x;

        service['move'](service, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint.x).toEqual(initialXValue + 3);
    });

    it('move should change startingPoint.y if isArrowKeyUpPressed', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        service.pressedKeys.set(ARROW_KEYS.UP, true);
        const initialYValue = service.selection.startingPoint.y;

        service['move'](service, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint.y).toEqual(initialYValue - 3);
    });

    it('move should change startingPoint.y if isArrowKeyDownPressed', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        service.pressedKeys.set(ARROW_KEYS.DOWN, true);
        const initialYValue = service.selection.startingPoint.y;

        service['move'](service, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint.y).toEqual(initialYValue + 3);
    });

    it('move should not change startingPoint if all keys are pressed', () => {
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        service.pressedKeys.set(ARROW_KEYS.LEFT, true);
        service.pressedKeys.set(ARROW_KEYS.UP, true);
        service.pressedKeys.set(ARROW_KEYS.RIGHT, true);
        service.pressedKeys.set(ARROW_KEYS.DOWN, true);
        const initialStartingPoint = service.selection.startingPoint;

        service['move'](service, false, 5);

        expect(printSelectionOnPreviewSpy).toHaveBeenCalled();
        expect(service.selection.startingPoint).toEqual(initialStartingPoint);
    });

    it('isArrowKeyPressed should return true if at least one arrowKey is pressed', () => {
        service.pressedKeys.set(ARROW_KEYS.UP, true);

        expect(service['isArrowKeyPressed']()).toBe(true);
    });

    it('isArrowKeyPressed should return true if all arrowKeys are pressed', () => {
        service.pressedKeys.set(ARROW_KEYS.LEFT, true);
        service.pressedKeys.set(ARROW_KEYS.UP, true);
        service.pressedKeys.set(ARROW_KEYS.RIGHT, true);
        service.pressedKeys.set(ARROW_KEYS.DOWN, true);

        expect(service['isArrowKeyPressed']()).toBe(true);
    });

    it('isArrowKeyPressed should return false if no arrowKeys are pressed', () => {
        expect(service['isArrowKeyPressed']()).toBe(false);
    });

    it('snapOnGrid should change selection.startingPoint.x and selection.startingPoint.x if key is ArrowLeft', () => {
        const baseCoordinates = { x: 14, y: 16 };
        service.selection.startingPoint = { x: 14, y: 16 };
        service.snapOnGrid({ key: 'ArrowLeft' } as KeyboardEvent, baseCoordinates, 5);

        expect(service.selection.startingPoint.x).toBe(10);
        expect(service.selection.startingPoint.y).toBe(15);
    });

    it('snapOnGrid should change selection.startingPoint.x and selection.startingPoint.x if key is ArrowLeft and changeY is bigger than half the square size', () => {
        const baseCoordinates = { x: 14, y: 14 };
        service.selection.startingPoint = { x: 14, y: 14 };
        service.snapOnGrid({ key: 'ArrowLeft' } as KeyboardEvent, baseCoordinates, 5);

        expect(service.selection.startingPoint.x).toBe(10);
        expect(service.selection.startingPoint.y).toBe(15);
    });

    it('snapOnGrid should change selection.startingPoint.x and selection.startingPoint.x if key is ArrowRight', () => {
        const baseCoordinates = { x: 16, y: 16 };
        service.selection.startingPoint = { x: 16, y: 16 };
        service.snapOnGrid({ key: 'ArrowRight' } as KeyboardEvent, baseCoordinates, 5);

        expect(service.selection.startingPoint.x).toBe(20);
        expect(service.selection.startingPoint.y).toBe(15);
    });

    it('snapOnGrid should change only selection.startingPoint.y if key is ArrowRight and x is on grid', () => {
        const baseCoordinates = { x: 15, y: 16 };
        service.selection.startingPoint = { x: 15, y: 16 };
        service.snapOnGrid({ key: 'ArrowRight' } as KeyboardEvent, baseCoordinates, 5);

        expect(service.selection.startingPoint.x).toBe(15);
        expect(service.selection.startingPoint.y).toBe(15);
    });

    it('snapOnGrid should change selection.startingPoint.x and selection.startingPoint.x if key is ArrowRight and changeY is bigger than half the square size', () => {
        const baseCoordinates = { x: 16, y: 18 };
        service.selection.startingPoint = { x: 16, y: 18 };
        service.snapOnGrid({ key: 'ArrowRight' } as KeyboardEvent, baseCoordinates, 5);

        expect(service.selection.startingPoint.x).toBe(20);
        expect(service.selection.startingPoint.y).toBe(20);
    });

    it('snapOnGrid should change selection.startingPoint.x and selection.startingPoint.x if key is ArrowUp', () => {
        const baseCoordinates = { x: 16, y: 16 };
        service.selection.startingPoint = { x: 16, y: 16 };
        service.snapOnGrid({ key: 'ArrowUp' } as KeyboardEvent, baseCoordinates, 5);

        expect(service.selection.startingPoint.x).toBe(15);
        expect(service.selection.startingPoint.y).toBe(15);
    });

    it('snapOnGrid should change selection.startingPoint.x and selection.startingPoint.x if key is ArrowUp and changeX is bigger than half the square size', () => {
        const baseCoordinates = { x: 18, y: 18 };
        service.selection.startingPoint = { x: 18, y: 18 };
        service.snapOnGrid({ key: 'ArrowUp' } as KeyboardEvent, baseCoordinates, 5);

        expect(service.selection.startingPoint.x).toBe(20);
        expect(service.selection.startingPoint.y).toBe(15);
    });

    it('snapOnGrid should change selection.startingPoint.x and selection.startingPoint.x if key is ArrowDown', () => {
        const baseCoordinates = { x: 16, y: 16 };
        service.selection.startingPoint = { x: 16, y: 16 };
        service.snapOnGrid({ key: 'ArrowDown' } as KeyboardEvent, baseCoordinates, 5);

        expect(service.selection.startingPoint.x).toBe(15);
        expect(service.selection.startingPoint.y).toBe(20);
    });

    it('snapOnGrid should change selection.startingPoint.x and selection.startingPoint.x if key is ArrowDown and changeX is bigger than half the square size', () => {
        const baseCoordinates = { x: 18, y: 16 };
        service.selection.startingPoint = { x: 18, y: 16 };
        service.snapOnGrid({ key: 'ArrowDown' } as KeyboardEvent, baseCoordinates, 5);

        expect(service.selection.startingPoint.x).toBe(20);
        expect(service.selection.startingPoint.y).toBe(20);
    });

    it('snapOnGrid should change only selection.startingPoint.x if key is ArrowDown and y is on grid already', () => {
        const baseCoordinates = { x: 16, y: 15 };
        service.selection.startingPoint = { x: 16, y: 15 };
        service.snapOnGrid({ key: 'ArrowDown' } as KeyboardEvent, baseCoordinates, 5);

        expect(service.selection.startingPoint.x).toBe(15);
        expect(service.selection.startingPoint.y).toBe(15);
    });

    it('snapOnGrid should not do anything if key is invalid', () => {
        const baseCoordinates = { x: 16, y: 15 };
        const printSelectionOnPreviewSpy = spyOn(service, 'printSelectionOnPreview');
        // tslint:disable-next-line: no-empty
        service.intervalId = setTimeout(() => {}, 100);
        service.pressedKeys.set(ARROW_KEYS.LEFT, true);

        service.snapOnGrid({ key: 'j' } as KeyboardEvent, baseCoordinates, 5);

        expect(printSelectionOnPreviewSpy).not.toHaveBeenCalled();
    });
});
