import { TestBed } from '@angular/core/testing';
import { SelectionBox } from '@app/classes/selection-box';
import { ALIGNMENT_NAMES } from '@app/ressources/global-variables/alignment-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MoveService } from '@app/services/tools/transformation-services/move.service';
import { RotateService } from '@app/services/tools/transformation-services/rotate.service';
import { CircleSelectionService } from './circle-selection.service';

describe('CircleSelectionService', () => {
    let service: CircleSelectionService;
    let drawingService: DrawingService;
    let selectionBox: SelectionBox;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let moveServiceSpy: jasmine.SpyObj<MoveService>;
    let rotateServiceSpy: jasmine.SpyObj<RotateService>;

    const WIDTH = 100;
    const HEIGHT = 100;

    beforeEach(() => {
        selectionBox = {
            startingPoint: { x: 0, y: 0 },
            width: 10,
            height: 10,
        };
        moveServiceSpy = jasmine.createSpyObj('MoveService', ['initialize']);
        rotateServiceSpy = jasmine.createSpyObj('RotateService', ['initialize', 'rotatePreviewCanvas']);
        TestBed.configureTestingModule({
            providers: [
                { provide: MoveService, useValue: moveServiceSpy },
                { provide: RotateService, useValue: rotateServiceSpy },
            ],
        });
        service = TestBed.inject(CircleSelectionService);
        drawingService = TestBed.inject(DrawingService);

        const drawCanvas = document.createElement('canvas');
        drawCanvas.width = WIDTH;
        drawCanvas.height = HEIGHT;
        previewCtxStub = drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        const canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvasStub = canvas as HTMLCanvasElement;

        drawingService.previewCtx = previewCtxStub;
        drawingService.canvas = canvasStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call drawImage with good params', () => {
        const ctx = service.selectionImage.getContext('2d') as CanvasRenderingContext2D;
        const drawImageSpy = spyOn(ctx, 'drawImage');
        const height = 10;
        const width = 10;
        const startingPointX = 0;
        const startingPointY = 0;
        service.selection.height = height;
        service.selection.width = width;
        service.selection.startingPoint = { x: startingPointX, y: startingPointY };
        service.setSelectionData();
        expect(drawImageSpy).toHaveBeenCalledWith(
            drawingService.canvas,
            startingPointX,
            startingPointY,
            width,
            height,
            startingPointX,
            startingPointY,
            width,
            height,
        );
        expect(moveServiceSpy.initialize).toHaveBeenCalled();
    });

    it('should call ellipse with good params', () => {
        const ctx = service.selectionImage.getContext('2d') as CanvasRenderingContext2D;
        const ellipseSpy = spyOn(ctx, 'ellipse');
        const height = 10;
        const width = 10;
        service.selection.height = height;
        service.selection.width = width;
        service.setSelectionData();
        expect(ellipseSpy).toHaveBeenCalledWith(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
        expect(moveServiceSpy.initialize).toHaveBeenCalled();
    });

    it('should call strokeRect with good params', () => {
        const strokeRectSpy = spyOn(drawingService.previewCtx, 'strokeRect');
        const height = 10;
        const width = 10;
        const startingPointX = 0;
        const startingPointY = 0;
        service.selection.height = height;
        service.selection.width = width;
        service.selection.startingPoint = { x: startingPointX, y: startingPointY };
        moveServiceSpy.selection = selectionBox;

        service.strokeSelection();
        expect(strokeRectSpy).toHaveBeenCalledWith(startingPointX, startingPointY, width, height);
    });

    it('strokeSelection should call ellipse with good params', () => {
        const ellipseSpy = spyOn(drawingService.previewCtx, 'ellipse');
        const height = 10;
        const width = 10;
        const startingPointX = 0;
        const startingPointY = 0;
        service.selection.startingPoint = { x: startingPointX, y: startingPointY };
        service.selection.height = height;
        service.selection.width = width;
        moveServiceSpy.selection = selectionBox;
        service.strokeSelection();
        expect(ellipseSpy).toHaveBeenCalledWith(startingPointX + width / 2, startingPointY + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    });

    it('should not call strokeRect if height or width is 0', () => {
        service.selection.height = 0;
        const strokeRectSpy = spyOn(drawingService.previewCtx, 'strokeRect');
        service.strokeSelection();
        expect(strokeRectSpy).not.toHaveBeenCalled();
    });

    it('should setMagnetismAlignment', () => {
        service.currentAlignment = ALIGNMENT_NAMES.ALIGN_BOTTOM_CENTER_NAME;
        service.setMagnetismAlignment(ALIGNMENT_NAMES.ALIGN_CENTER_LEFT_NAME);
        expect(service.currentAlignment).toEqual(ALIGNMENT_NAMES.ALIGN_CENTER_LEFT_NAME);
    });
});
