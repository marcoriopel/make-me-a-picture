import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SliderComponent } from './slider.component';

describe('SliderComponent', () => {
    let component: SliderComponent;
    let fixture: ComponentFixture<SliderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [SliderComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should decrement value', () => {
        component.min = 0;
        component.value = 1;
        component.step = 1;
        component.decrement();
        fixture.detectChanges();
        expect(component.value).toBe(0);
    });

    it('should not decrement value', () => {
        component.min = 0;
        component.value = 0;
        component.step = 1;
        component.decrement();
        fixture.detectChanges();
        expect(component.value).toBe(0);
    });

    it('should increment value', () => {
        component.max = 1;
        component.value = 0;
        component.step = 1;
        component.increment();
        fixture.detectChanges();
        expect(component.value).toBe(1);
    });

    it('should not increment value', () => {
        component.max = 1;
        component.value = 1;
        component.step = 1;
        component.increment();
        fixture.detectChanges();
        expect(component.value).toBe(1);
    });

    it('should emit value', () => {
        spyOn(component.valueChange, 'emit');
        component.value = 1;
        component.step = 1;
        component.changeValue();
        expect(component.valueChange.emit).toHaveBeenCalledWith(1);
    });
});
