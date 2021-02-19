import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EraserService } from '@app/services/tools/eraser.service';
import { EraserAttributesComponent } from './eraser-attributes.component';

describe('EraserAttributesComponent', () => {
    let component: EraserAttributesComponent;
    let fixture: ComponentFixture<EraserAttributesComponent>;
    let eraserServiceSpy: jasmine.SpyObj<EraserService>;
    const initialToolWidth = 1;
    const finalToolWidth = 5;

    beforeEach(async(() => {
        eraserServiceSpy = jasmine.createSpyObj('EraserService', ['changeWidth']);

        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [EraserAttributesComponent],
            providers: [{ provide: EraserService, useValue: eraserServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EraserAttributesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call changeWidth of eraserService', () => {
        component.changeWidth(finalToolWidth);
        expect(component.eraserService.changeWidth).toHaveBeenCalled();
    });

    it('should change toolWidth', () => {
        component.toolWidth = initialToolWidth;
        component.changeWidth(finalToolWidth);
        expect(component.toolWidth).toBe(finalToolWidth);
    });
});
