import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LineService } from '@app/services/tools/line.service';
import { LineAttributesComponent } from './line-attributes.component';

describe('LineAttributesComponent', () => {
    let component: LineAttributesComponent;
    let fixture: ComponentFixture<LineAttributesComponent>;
    let lineServiceSpy: jasmine.SpyObj<LineService>;
    const initialToolWidth = 1;
    const finalToolWidth = 5;

    beforeEach(async(() => {
        lineServiceSpy = jasmine.createSpyObj('LineService', ['changeLineWidth', 'changeDotWidth', 'changeJunction']);

        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [LineAttributesComponent],
            providers: [{ provide: LineService, useValue: lineServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LineAttributesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call changeDotWidth of lineService', () => {
        component.changeDotWidth(finalToolWidth);
        expect(component.lineService.changeDotWidth).toHaveBeenCalled();
    });

    it('should change dotWith', () => {
        component.dotWith = initialToolWidth;
        component.changeDotWidth(finalToolWidth);
        expect(component.dotWith).toBe(finalToolWidth);
    });

    it('should call changeLineWidth of lineService', () => {
        component.changeLineWidth(finalToolWidth);
        expect(component.lineService.changeLineWidth).toHaveBeenCalled();
    });

    it('should change toolWidth', () => {
        component.toolWidth = initialToolWidth;
        component.changeLineWidth(finalToolWidth);
        expect(component.toolWidth).toBe(finalToolWidth);
    });

    it('should call changeJunction of lineService', () => {
        component.changeJunctionPoint(true);
        expect(component.lineService.changeJunction).toHaveBeenCalled();
    });
});
