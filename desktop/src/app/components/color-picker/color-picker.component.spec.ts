import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAXIMUM_NUMBER_OF_COLORS, MAX_OPACITY, MouseButton } from '@app/ressources/global-variables/global-variables';
import { ColorPickerComponent } from './color-picker.component';

class KeyEventMock {
    key: string = 'o';
    ctrlKey: boolean = true;
    // tslint:disable-next-line: no-empty
    stopPropagation(): void {}
}

describe('ColorPickerComponent', () => {
    let keyboardEvent: KeyboardEvent;
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;
    let mouseEventClickLeft: MouseEvent;
    let mouseEventClickRight: MouseEvent;
    let baseCtxStub: CanvasRenderingContext2D;
    const MAX_CANVAS_HEIGTH = 100;
    const MAX_CANVAS_WIDTH = 100;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [ColorPickerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.width = MAX_CANVAS_WIDTH;
        canvas.height = MAX_CANVAS_HEIGTH;
        baseCtxStub = canvas.getContext('2d') as CanvasRenderingContext2D;
        // tslint:disable-next-line: no-string-literal
        component.pipetteService['drawingService'].baseCtx = baseCtxStub;
        keyboardEvent = new KeyboardEvent('keypress', {
            key: 'Shift',
        });
        mouseEventClickLeft = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;

        mouseEventClickRight = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.RIGHT,
        } as MouseEvent;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('hexToRGBA should return rgba(0,0,0,1) when given #000000 with 100% opacity', () => {
        const color = '#000000';
        const opacity = 100;
        const expectedValue = 'rgba(0,0,0,1)';
        const returnValue = component.hexToRGBA(color, opacity);
        expect(returnValue).toEqual(expectedValue);
    });

    it('primary color should be #000000 on component creation', () => {
        expect(component.primaryColor).toEqual('#000000');
    });

    it('secondary color should be #000000 on component creation', () => {
        expect(component.secondaryColor).toEqual('#000000');
    });

    it('primary opacity should be 100 on component creation', () => {
        expect(component.primaryOpacity).toEqual(MAX_OPACITY);
    });

    it('secondary opacity should be 100 on component creation', () => {
        expect(component.secondaryOpacity).toEqual(MAX_OPACITY);
    });

    it('last 10 colors used array should have a length of one (#000000) on component creation', () => {
        expect(component.colors.length).toEqual(1);
        expect(component.colors[0]).toEqual('#000000');
    });

    it('onInput should call event.stopPropagation', () => {
        const keyEvent = new KeyEventMock() as KeyboardEvent;
        const eventSpy = spyOn(keyEvent, 'stopPropagation');
        component.onInput(keyEvent);
        expect(eventSpy).toHaveBeenCalled();
    });

    it('should change primary color to #ffffff', () => {
        component.primaryColor = '#000000';
        const expectedValue = '#ffffff';
        component.changePrimaryColor(expectedValue);
        expect(component.primaryColor).toEqual(expectedValue);
    });

    it('should add #ffffff to first position of recently used colors array when changing primary color', () => {
        const color = '#ffffff';
        component.changePrimaryColor(color);
        expect(component.colors[0]).toEqual(color);
    });

    it('should change secondary color to #ffffff', () => {
        component.secondaryColor = '#000000';
        const expectedValue = '#ffffff';
        component.changeSecondaryColor(expectedValue);
        expect(component.secondaryColor).toEqual(expectedValue);
    });

    it('should add #ffffff to first position of recently used colors array when changing secondary color', () => {
        const color = '#ffffff';
        component.changeSecondaryColor(color);
        expect(component.colors[0]).toEqual(color);
    });

    it('should not change length to 11 when changing primary color with 10 recently used colors', () => {
        for (let i = 1; i < MAXIMUM_NUMBER_OF_COLORS; i++) {
            component.colors.push('#000000');
        }
        const color = '#ffffff';
        component.changePrimaryColor(color);
        expect(component.colors.length).toEqual(MAXIMUM_NUMBER_OF_COLORS);
    });

    it('should not change length to 11 when changing secondary color with 10 recently used colors', () => {
        for (let i = 1; i < MAXIMUM_NUMBER_OF_COLORS; i++) {
            component.colors.push('#000000');
        }
        const color = '#ffffff';
        component.changeSecondaryColor(color);
        expect(component.colors.length).toEqual(MAXIMUM_NUMBER_OF_COLORS);
    });

    it('swap colors should swap primary and secondary colors', () => {
        const primaryColor = '#fafafa';
        component.primaryColor = primaryColor;
        const secondaryColor = '#f2f2f2';
        component.secondaryColor = secondaryColor;
        component.swapColors();
        expect(component.secondaryColor).toEqual(primaryColor);
        expect(component.primaryColor).toEqual(secondaryColor);
    });

    it('should decrement primary opacity by 1', () => {
        component.primaryOpacity = MAX_OPACITY;
        component.decrementPrimaryOpacity();
        expect(component.primaryOpacity).toEqual(MAX_OPACITY - 1);
    });

    it('should not decrement primary opacity because already at minimum', () => {
        component.primaryOpacity = component.minOpacity;
        component.decrementPrimaryOpacity();
        expect(component.primaryOpacity).toEqual(component.minOpacity);
    });

    it('should decrement secondary opacity by 1', () => {
        component.secondaryOpacity = MAX_OPACITY;
        component.decrementSecondaryOpacity();
        expect(component.secondaryOpacity).toEqual(MAX_OPACITY - 1);
    });

    it('should not decrement secondary opacity because already at minimum', () => {
        component.secondaryOpacity = component.minOpacity;
        component.decrementSecondaryOpacity();
        expect(component.secondaryOpacity).toEqual(component.minOpacity);
    });

    it('should increment primary opacity by 1', () => {
        component.primaryOpacity = component.minOpacity;
        component.incrementPrimaryOpacity();
        expect(component.primaryOpacity).toEqual(component.minOpacity + 1);
    });

    it('should not increment primary opacity because already at maximum', () => {
        component.primaryOpacity = MAX_OPACITY;
        component.incrementPrimaryOpacity();
        expect(component.primaryOpacity).toEqual(MAX_OPACITY);
    });

    it('should increment secondary opacity by 1', () => {
        component.secondaryOpacity = component.minOpacity;
        component.incrementSecondaryOpacity();
        expect(component.secondaryOpacity).toEqual(component.minOpacity + 1);
    });

    it('should not increment secondary opacity because already at maximum', () => {
        component.secondaryOpacity = MAX_OPACITY;
        component.incrementSecondaryOpacity();
        expect(component.primaryOpacity).toEqual(MAX_OPACITY);
    });

    it('should block primary opacity change if opacity input is less than 0 (reset back to 100%)', () => {
        const opacity = -1;
        component.changePrimaryOpacity(opacity, keyboardEvent);
        expect(component.primaryOpacity).toEqual(MAX_OPACITY);
    });

    it('should block secondary opacity change if opacity input is less than 0 (reset back to 100%)', () => {
        const opacity = -1;
        component.changeSecondaryOpacity(opacity, keyboardEvent);
        expect(component.secondaryOpacity).toEqual(MAX_OPACITY);
    });

    it('should block primary opacity change if opacity input is greater than 100 (reset back to 100%)', () => {
        const opacity = 101;
        component.changePrimaryOpacity(opacity, keyboardEvent);
        expect(component.primaryOpacity).toEqual(MAX_OPACITY);
    });

    it('should block secondary opacity change if opacity input is greater than 100 (reset back to 100%)', () => {
        const opacity = 101;
        component.changeSecondaryOpacity(opacity, keyboardEvent);
        expect(component.secondaryOpacity).toEqual(MAX_OPACITY);
    });

    it('should change primary opacity if input respect validation conditions', () => {
        component.primaryOpacity = MAX_OPACITY;
        const opacity = 90;
        component.changePrimaryOpacity(opacity, keyboardEvent);
        expect(component.primaryOpacity).toEqual(opacity);
    });

    it('should change secondary opacity if input respect validation conditions', () => {
        component.secondaryOpacity = MAX_OPACITY;
        const opacity = 90;
        component.changeSecondaryOpacity(opacity, keyboardEvent);
        expect(component.secondaryOpacity).toEqual(opacity);
    });

    it('should change primary color when restoring a previously used color (#ffffff)', () => {
        component.primaryColor = '#000000';
        const color = '#ffffff';
        component.restorePreviousColor(color, true);
        expect(component.primaryColor).toEqual(color);
    });

    it('should change secondary color when restoring a previously used color (#ffffff)', () => {
        component.secondaryColor = '#000000';
        const color = '#ffffff';
        component.restorePreviousColor(color, false);
        expect(component.secondaryColor).toEqual(color);
    });

    it('Should change the primary color and the primary opacity when left clic of pipette', () => {
        const changePrimaryColorSpy = spyOn(component, 'changePrimaryColor');
        component.pipetteService.onMouseDown(mouseEventClickLeft);
        expect(changePrimaryColorSpy).toHaveBeenCalled();
    });

    it('Should change the secondary color and the secpndary opacity when right click of pipette', () => {
        const changeSecondaryColorSpy = spyOn(component, 'changeSecondaryColor');
        component.pipetteService.onMouseDown(mouseEventClickRight);
        expect(changeSecondaryColorSpy).toHaveBeenCalled();
    });
});
