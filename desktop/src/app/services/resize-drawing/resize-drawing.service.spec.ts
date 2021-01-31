import { TestBed } from '@angular/core/testing';
import { Brush, Ellipse, Eraser, Fill, Line, Pencil, Polygone, Rectangle, Resize } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { CANVAS_RESIZING_POINTS } from '@app/ressources/global-variables/canvas-resizing-points';
import { MINIMUM_CANVAS_HEIGHT, MINIMUM_CANVAS_WIDTH, MouseButton } from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Observable, Subject } from 'rxjs';
import { ResizeDrawingService } from './resize-drawing.service';

class DrawingServiceMock {
    baseCtx: CanvasRenderingContext2D;
    gridCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    gridSpacing: number;
    opacity: number;
    isGridEnabled: boolean;
    canvas: HTMLCanvasElement = document.createElement('canvas');
    gridCanvas: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement = document.createElement('canvas');
    undoStack: (Pencil | Brush | Eraser | Polygone | Line | Resize | Fill | Rectangle | Ellipse | Selection)[] = [];
    redoStack: (Pencil | Brush | Eraser | Polygone | Line | Resize | Fill | Rectangle | Ellipse | Selection)[] = [];
    isToolInUse: Subject<boolean> = new Subject<boolean>();
    imageData: ImageData;
    pixelData: Uint8ClampedArray;
    constructor() {
        this.canvas.height = MINIMUM_CANVAS_HEIGHT;
        this.canvas.width = MINIMUM_CANVAS_WIDTH;
        this.baseCtx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.imageData = this.baseCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
    // tslint:disable: no-empty
    initializeBaseCanvas(): void {}
    clearCanvas(): void {}
    drawFill(): void {}
    isCanvasBlank(): boolean {
        return false;
    }

    setGrid(): void {}
    updateStack(): void {}
    getPixelData(): Uint8ClampedArray {
        return this.pixelData;
    }
    getCanvasData(): ImageData {
        return this.imageData;
    }
    restoreSelection(): void {}
    getPreviewData(): ImageData {
        return this.imageData;
    }
    setIsToolInUse(): void {}
    getIsToolInUse(): Observable<boolean> {
        return this.isToolInUse.asObservable();
    }
    resetStack(): void {}
    applyPreview(): void {}
    autoSave(): void {}
}

// tslint:disable: no-magic-numbers
describe('ResizeDrawingService', () => {
    let service: ResizeDrawingService;
    let mouseEvent: MouseEvent;
    let target: HTMLElement;
    let drawingService: DrawingServiceMock;

    beforeEach(() => {
        drawingService = new DrawingServiceMock();
        drawingService.canvas.width = MINIMUM_CANVAS_WIDTH;
        drawingService.canvas.height = MINIMUM_CANVAS_HEIGHT;

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingService }],
        });
        service = TestBed.inject(ResizeDrawingService);

        target = {
            id: CANVAS_RESIZING_POINTS.VERTICAL,
        } as HTMLElement;

        mouseEvent = ({
            clientX: 500,
            clientY: 500,
            target,
            button: MouseButton.LEFT,
        } as unknown) as MouseEvent;

        service.previewSize = { x: 400, y: 400 };
        service.canvasSize = { x: 400, y: 400 };
        service.mouseDownCoord = { x: 200, y: 400 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set default canvas size to half workspace size', () => {
        service.workSpaceSize = { x: 800, y: 900 };
        service.setDefaultCanvasSize();
        expect(service.previewSize).toEqual({ x: 400, y: 450 });
        expect(service.canvasSize).toEqual({ x: 400, y: 450 });
    });

    it('should set default canvas size to minimum canvas size', () => {
        service.workSpaceSize = { x: 200, y: 200 };
        service.setDefaultCanvasSize();
        expect(service.previewSize).toEqual({ x: 250, y: 250 });
        expect(service.canvasSize).toEqual({ x: 250, y: 250 });
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            button: MouseButton.RIGHT,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 500, y: 500 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set serviceCaller to correct value', () => {
        const expectedResult = CANVAS_RESIZING_POINTS.VERTICAL;
        service.onMouseDown(mouseEvent);
        expect(service.serviceCaller).toEqual(expectedResult);
    });

    it('mouseUp should set mouseDown to false', () => {
        service.mouseDown = true;
        service.onMouseUp();
        expect(service.mouseDown).toBe(false);
    });

    it('mouseUp should leave mouseDown to false', () => {
        service.mouseDown = false;
        service.onMouseUp();
        expect(service.mouseDown).toBe(false);
    });

    it('should get position from mouse', () => {
        expect(service.getPositionFromMouse(mouseEvent)).toEqual({ x: 500, y: 500 });
    });

    it('should change previewSize width', () => {
        service.mouseDown = true;
        service.serviceCaller = CANVAS_RESIZING_POINTS.VERTICAL;
        service.resizeCanvas(mouseEvent);
        expect(service.previewSize).toEqual({ x: 400, y: 500 });
    });

    it('should not change previewSize width', () => {
        const localMouseEvent = ({
            clientX: 50,
            clientY: 50,
        } as unknown) as MouseEvent;
        service.mouseDown = true;
        service.serviceCaller = CANVAS_RESIZING_POINTS.VERTICAL;
        service.resizeCanvas(localMouseEvent);
        expect(service.previewSize).toEqual({ x: 400, y: 400 });
    });

    it('should not change previewSize on verticalResize', () => {
        service.mouseDown = false;
        service.serviceCaller = CANVAS_RESIZING_POINTS.VERTICAL;
        service.resizeCanvas(mouseEvent);
        expect(service.previewSize).toEqual({ x: 400, y: 400 });
    });

    it('should change previewSize height', () => {
        service.mouseDown = true;
        service.mouseDownCoord = { x: 400, y: 200 };
        service.serviceCaller = CANVAS_RESIZING_POINTS.HORIZONTAL;
        service.resizeCanvas(mouseEvent);
        expect(service.previewSize).toEqual({ x: 500, y: 400 });
    });

    it('should not change previewSize height', () => {
        const localMouseEvent = ({
            clientX: 50,
            clientY: 50,
        } as unknown) as MouseEvent;
        service.mouseDown = true;
        service.mouseDownCoord = { x: 400, y: 200 };
        service.serviceCaller = CANVAS_RESIZING_POINTS.HORIZONTAL;
        service.resizeCanvas(localMouseEvent);
        expect(service.previewSize).toEqual({ x: 400, y: 400 });
    });

    it('should not change previewSize on horizontalResize', () => {
        service.mouseDown = false;
        service.serviceCaller = CANVAS_RESIZING_POINTS.HORIZONTAL;
        service.resizeCanvas(mouseEvent);
        expect(service.previewSize).toEqual({ x: 400, y: 400 });
    });

    it('should change previewSize height and width', () => {
        service.mouseDown = true;
        service.mouseDownCoord = { x: 400, y: 400 };
        service.serviceCaller = CANVAS_RESIZING_POINTS.VERTICAL_AND_HORIZONTAL;
        service.resizeCanvas(mouseEvent);
        expect(service.previewSize).toEqual({ x: 500, y: 500 });
    });

    it('should not change previewSize height and width', () => {
        const localMouseEvent = ({
            clientX: 50,
            clientY: 50,
        } as unknown) as MouseEvent;
        service.mouseDown = true;
        service.mouseDownCoord = { x: 400, y: 400 };
        service.serviceCaller = CANVAS_RESIZING_POINTS.VERTICAL_AND_HORIZONTAL;
        service.resizeCanvas(localMouseEvent);
        expect(service.previewSize).toEqual({ x: 400, y: 400 });
    });

    it('should not change previewSize on verticalAndHorizontalResize', () => {
        service.mouseDown = false;
        service.serviceCaller = CANVAS_RESIZING_POINTS.VERTICAL_AND_HORIZONTAL;
        service.resizeCanvas(mouseEvent);
        expect(service.previewSize).toEqual({ x: 400, y: 400 });
    });

    it('should not change previewSize on resizeCanvas', () => {
        service.mouseDown = true;
        service.serviceCaller = 'not an actual possibility';
        service.resizeCanvas(mouseEvent);
        expect(service.previewSize).toEqual({ x: 400, y: 400 });
    });

    it('canvas should have same context after resize', () => {
        service.drawingService.canvas.width = 20;
        service.drawingService.canvas.height = 20;
        const ctxBeforeResize = service.drawingService.canvas.getContext('2d') as CanvasRenderingContext2D;
        ctxBeforeResize.beginPath();
        ctxBeforeResize.rect(0, 0, 10, 15);
        ctxBeforeResize.fillRect(0, 0, 10, 15);
        ctxBeforeResize.stroke();
        const imageBeforeResize = ctxBeforeResize.getImageData(0, 0, 20, 20);

        service.previewSize = { x: 500, y: 500 };
        service.canvasSize = { x: 20, y: 20 };
        service.mouseDown = true;
        service.onMouseUp();

        const ctxAfterResize = service.drawingService.canvas.getContext('2d') as CanvasRenderingContext2D;
        const imageAfterResize = ctxAfterResize.getImageData(0, 0, 20, 20);
        expect(imageAfterResize).toEqual(imageBeforeResize);
    });

    it('should resize canvas onMouseUp if mouseDown is true', () => {
        const expectedResult = { x: 500, y: 500 };
        service.previewSize = { x: 500, y: 500 };
        service.drawingService.canvas.width = service.canvasSize.x;
        service.drawingService.canvas.height = service.canvasSize.y;
        service.mouseDown = true;

        service.onMouseUp();
        expect(service.canvasSize).toEqual(expectedResult);
    });

    it('should resize canvas size', () => {
        const expectedResult = { x: 500, y: 500 };
        service.resizeCanvasSize(expectedResult.x, expectedResult.y);
        expect(service.previewSize).toEqual(expectedResult);
    });

    it('should restore canvas', () => {
        const imageDataSpy = spyOn(drawingService.baseCtx, 'putImageData');
        const expectedData = { type: {} as string, canvasSize: { x: 500, y: 500 }, imageData: {} as ImageData };
        service.restoreCanvas(expectedData);
        expect(service.previewSize).toEqual(expectedData.canvasSize);
        expect(imageDataSpy).toHaveBeenCalled();
    });
});
