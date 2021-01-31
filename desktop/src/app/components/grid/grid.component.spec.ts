/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GRID_STEP, MAX_GRID_SQUARE_SIZE, MIN_GRID_SQUARE_SIZE } from '@app/ressources/global-variables/global-variables';
import { GRID_DECREASE_NAME, GRID_INCREASE_NAME, GRID_NAME } from '@app/ressources/global-variables/grid-elements';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { CircleSelectionService } from '@app/services/tools/selection-services/circle-selection.service';
import { SquareSelectionService } from '@app/services/tools/selection-services/square-selection.service';
import { Subject } from 'rxjs';
import { GridComponent } from './grid.component';
import SpyObj = jasmine.SpyObj;

// tslint:disable: no-magic-numbers
describe('GridComponent', () => {
    let component: GridComponent;
    let fixture: ComponentFixture<GridComponent>;
    let drawingServiceSpy: SpyObj<DrawingService>;
    let hotkeyServiceSpy: SpyObj<HotkeyService>;
    let circleSelectionServiceSpy: SpyObj<CircleSelectionService>;
    let squareSelectionServiceSpy: SpyObj<SquareSelectionService>;
    let obs: Subject<string>;

    beforeEach(async(() => {
        hotkeyServiceSpy = jasmine.createSpyObj('HotkeyService', ['getKey']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'setGrid']);
        circleSelectionServiceSpy = jasmine.createSpyObj('HotkeyService', ['setGridSpacing']);
        squareSelectionServiceSpy = jasmine.createSpyObj('HotkeyService', ['setGridSpacing']);
        obs = new Subject<string>();
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());

        TestBed.configureTestingModule({
            declarations: [GridComponent],
            providers: [
                { provide: HotkeyService, useValue: hotkeyServiceSpy },
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: CircleSelectionService, useValue: circleSelectionServiceSpy },
                { provide: SquareSelectionService, useValue: squareSelectionServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call setgrid if grid is enabled', () => {
        component.changeGridView(true);
        expect(drawingServiceSpy.setGrid).toHaveBeenCalled();
    });

    it('should call changeGridView with false on valid hotkey if grid is enabled', () => {
        component.isEnabled = true;
        const changeGridViewSpy = spyOn(component, 'changeGridView');
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next(GRID_NAME);
        expect(changeGridViewSpy).toHaveBeenCalledWith(false);
    });

    it('should call changeGridView with true on valid hotkey if grid is disabled', () => {
        component.isEnabled = false;
        const changeGridViewSpy = spyOn(component, 'changeGridView');
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next(GRID_NAME);
        expect(changeGridViewSpy).toHaveBeenCalledWith(true);
    });

    it('should call changeGridSize with value increase on valid hotkey if less than maximum', () => {
        component.currentSquareSize = MIN_GRID_SQUARE_SIZE;
        const changeGridSizeSpy = spyOn(component, 'changeGridSize');
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next(GRID_INCREASE_NAME);
        expect(changeGridSizeSpy).toHaveBeenCalledWith(MIN_GRID_SQUARE_SIZE + GRID_STEP);
    });

    it('should not call changeGridSize with value increase on valid hotkey if more than maximum', () => {
        component.currentSquareSize = MAX_GRID_SQUARE_SIZE;
        const changeGridSizeSpy = spyOn(component, 'changeGridSize');
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next(GRID_INCREASE_NAME);
        expect(changeGridSizeSpy).not.toHaveBeenCalled();
    });

    it('should call changeGridSize with value decrease on valid hotkey if more than minimum', () => {
        component.currentSquareSize = MAX_GRID_SQUARE_SIZE;
        const changeGridSizeSpy = spyOn(component, 'changeGridSize');
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next(GRID_DECREASE_NAME);
        expect(changeGridSizeSpy).toHaveBeenCalledWith(MAX_GRID_SQUARE_SIZE - GRID_STEP);
    });

    it('should not call changeGridSize with value decrease on valid hotkey if less than minimum', () => {
        component.currentSquareSize = MIN_GRID_SQUARE_SIZE;
        const changeGridSizeSpy = spyOn(component, 'changeGridSize');
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next(GRID_DECREASE_NAME);
        expect(changeGridSizeSpy).not.toHaveBeenCalled();
    });

    it('should not changeGridView on invalid hotkey', () => {
        const changeGridViewSpy = spyOn(component, 'changeGridView');
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next('not good');
        expect(changeGridViewSpy).not.toHaveBeenCalled();
    });

    it('should clear canvas when grid view is disabled', () => {
        component.changeGridView(false);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should set grid spacing and set grid on grid size change if grid is enabled', () => {
        component.isEnabled = true;
        component.changeGridSize(10);
        expect(circleSelectionServiceSpy.setGridSpacing).toHaveBeenCalled();
        expect(squareSelectionServiceSpy.setGridSpacing).toHaveBeenCalled();
        expect(drawingServiceSpy.setGrid).toHaveBeenCalled();
    });

    it('should set grid spacing and not set grid on grid size change if grid is disabled', () => {
        component.isEnabled = false;
        component.changeGridSize(10);
        expect(circleSelectionServiceSpy.setGridSpacing).toHaveBeenCalled();
        expect(squareSelectionServiceSpy.setGridSpacing).toHaveBeenCalled();
        expect(drawingServiceSpy.setGrid).not.toHaveBeenCalled();
    });

    it('should change opacity on changeOpacity call and set grid if grid is enabled', () => {
        component.isEnabled = true;
        component.currentOpacity = 100;
        component.changeOpacity(50);
        expect(drawingServiceSpy.setGrid).toHaveBeenCalled();
        expect(component.currentOpacity).toEqual(50);
    });

    it('should change opacity on changeOpacity call and not set grid if grid is disabled', () => {
        component.isEnabled = false;
        component.currentOpacity = 100;
        component.changeOpacity(50);
        expect(drawingServiceSpy.setGrid).not.toHaveBeenCalled();
        expect(component.currentOpacity).toEqual(50);
    });
});
