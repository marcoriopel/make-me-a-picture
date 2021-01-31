import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TypeOfFillSelectionComponent } from './type-of-fill-selection.component';

describe('TypeOfFillSelectionComponent', () => {
    let component: TypeOfFillSelectionComponent;
    let fixture: ComponentFixture<TypeOfFillSelectionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TypeOfFillSelectionComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TypeOfFillSelectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('handleValueChange should emit event', () => {
        const value = '3';
        const target = ({
            value,
        } as unknown) as HTMLInputElement;

        const event = ({
            target,
        } as unknown) as InputEvent;

        const eventEmiterSpy = spyOn(component.valueChange, 'emit');
        component.changeValue(event);
        // tslint:disable-next-line: no-magic-numbers
        expect(eventEmiterSpy).toHaveBeenCalledWith(3);
    });
});
