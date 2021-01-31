/* tslint:disable:no-unused-variable */

import { TestBed } from '@angular/core/testing';
import { SelectionBox } from '@app/classes/selection-box';
import { ALIGNMENT_NAMES } from '@app/ressources/global-variables/alignment-names';
import { GridInfo } from '@app/ressources/global-variables/grid-info';
import { MoveService } from '@app/services/tools/transformation-services/move.service';
import { MagnetismService } from './magnetism.service';

// tslint:disable: no-magic-numbers

describe('MagnetismService', () => {
    let service: MagnetismService;
    let selection: SelectionBox;
    let moveServiceSpy: jasmine.SpyObj<MoveService>;
    beforeEach(() => {
        moveServiceSpy = jasmine.createSpyObj('MoveService', ['onMouseMove']);

        TestBed.configureTestingModule({
            providers: [{ provide: MoveService, useValue: moveServiceSpy }],
        });
        selection = { startingPoint: { x: 2, y: 2 }, width: 6, height: 6 };
        service = TestBed.inject(MagnetismService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return top left corner on top left corner alignment', () => {
        const reference = service.magnetismCoordinateReference(ALIGNMENT_NAMES.ALIGN_TOP_LEFT_NAME, selection);
        expect(reference).toEqual(selection.startingPoint);
    });

    it('should return ALIGN_TOP_RIGHT_NAME on ALIGN_TOP_RIGHT_NAME alignment', () => {
        const reference = service.magnetismCoordinateReference(ALIGNMENT_NAMES.ALIGN_TOP_RIGHT_NAME, selection);
        expect(reference).toEqual({ x: 8, y: 2 });
    });

    it('should return ALIGN_TOP_CENTER_NAME on ALIGN_TOP_CENTER_NAME alignment', () => {
        const reference = service.magnetismCoordinateReference(ALIGNMENT_NAMES.ALIGN_TOP_CENTER_NAME, selection);
        expect(reference).toEqual({ x: 5, y: 2 });
    });

    it('should return ALIGN_CENTER_LEFT_NAME on ALIGN_CENTER_LEFT_NAME alignment', () => {
        const reference = service.magnetismCoordinateReference(ALIGNMENT_NAMES.ALIGN_CENTER_LEFT_NAME, selection);
        expect(reference).toEqual({ x: 2, y: 5 });
    });

    it('should return ALIGN_CENTER_RIGHT_NAME on ALIGN_CENTER_RIGHT_NAME alignment', () => {
        const reference = service.magnetismCoordinateReference(ALIGNMENT_NAMES.ALIGN_CENTER_RIGHT_NAME, selection);
        expect(reference).toEqual({ x: 8, y: 5 });
    });

    it('should return ALIGN_CENTER_NAME on ALIGN_CENTER_NAME alignment', () => {
        const reference = service.magnetismCoordinateReference(ALIGNMENT_NAMES.ALIGN_CENTER_NAME, selection);
        expect(reference).toEqual({ x: 5, y: 5 });
    });

    it('should return ALIGN_BOTTOM_LEFT_NAME on ALIGN_BOTTOM_LEFT_NAME alignment', () => {
        const reference = service.magnetismCoordinateReference(ALIGNMENT_NAMES.ALIGN_BOTTOM_LEFT_NAME, selection);
        expect(reference).toEqual({ x: 2, y: 8 });
    });

    it('should return ALIGN_BOTTOM_CENTER_NAME on ALIGN_BOTTOM_CENTER_NAME alignment', () => {
        const reference = service.magnetismCoordinateReference(ALIGNMENT_NAMES.ALIGN_BOTTOM_CENTER_NAME, selection);
        expect(reference).toEqual({ x: 5, y: 8 });
    });

    it('should return ALIGN_BOTTOM_RIGHT_NAME on ALIGN_BOTTOM_RIGHT_NAME alignment', () => {
        const reference = service.magnetismCoordinateReference(ALIGNMENT_NAMES.ALIGN_BOTTOM_RIGHT_NAME, selection);
        expect(reference).toEqual({ x: 8, y: 8 });
    });

    it('should return change for x axis with the position less than half the grid size', () => {
        const gridInfo: GridInfo = { SQUARE_SIZE: 5, ALIGNMENT: ALIGNMENT_NAMES.ALIGN_TOP_LEFT_NAME };
        service.magnetismXAxisChange(3, gridInfo, selection);
        const changeX = service.magnetismXAxisChange(3, gridInfo, selection);
        expect(changeX).toEqual(3);
    });

    it('should return change for x axis with the position less than half the grid size', () => {
        const gridInfo: GridInfo = { SQUARE_SIZE: 3, ALIGNMENT: ALIGNMENT_NAMES.ALIGN_TOP_LEFT_NAME };
        service.magnetismXAxisChange(3, gridInfo, selection);
        const changeX = service.magnetismXAxisChange(3, gridInfo, selection);
        expect(changeX).toEqual(4);
    });

    it('should return change for y axis with the position less than half the grid size', () => {
        const gridInfo: GridInfo = { SQUARE_SIZE: 5, ALIGNMENT: ALIGNMENT_NAMES.ALIGN_TOP_LEFT_NAME };
        service.magnetismYAxisChange(3, gridInfo, selection);
        const changeY = service.magnetismYAxisChange(3, gridInfo, selection);
        expect(changeY).toEqual(3);
    });

    it('should return change for y axis with the position less than half the grid size', () => {
        const gridInfo: GridInfo = { SQUARE_SIZE: 3, ALIGNMENT: ALIGNMENT_NAMES.ALIGN_TOP_LEFT_NAME };
        service.magnetismYAxisChange(3, gridInfo, selection);
        const changeY = service.magnetismYAxisChange(3, gridInfo, selection);
        expect(changeY).toEqual(4);
    });

    it('should call mouse move of move service', () => {
        service.onMouseMoveMagnetism(2, 2);
        expect(moveServiceSpy.onMouseMove).toHaveBeenCalled();
    });
});
