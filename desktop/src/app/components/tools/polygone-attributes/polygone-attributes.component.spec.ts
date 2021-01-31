import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PolygoneService } from '@app/services/tools/polygone.service';
import { PolygoneAttributesComponent } from './polygone-attributes.component';

describe('PolygoneAttributesComponent', () => {
    let component: PolygoneAttributesComponent;
    let fixture: ComponentFixture<PolygoneAttributesComponent>;
    let polygoneServiceSpy: jasmine.SpyObj<PolygoneService>;
    const initialToolWidth = 1;
    const finalToolWidth = 5;
    const initialsides = 5;
    const finalsides = 10;

    beforeEach(async(() => {
        polygoneServiceSpy = jasmine.createSpyObj('PolygoneService', ['changeFillStyle', 'changeWidth', 'changeSides']);

        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [PolygoneAttributesComponent],
            providers: [{ provide: PolygoneService, useValue: polygoneServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PolygoneAttributesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call changeWidth of circleService', () => {
        component.changeBorderWidth(finalToolWidth);
        expect(polygoneServiceSpy.changeWidth).toHaveBeenCalled();
    });

    it('should change toolWidth', () => {
        component.toolWidth = initialToolWidth;
        component.changeBorderWidth(finalToolWidth);
        expect(component.toolWidth).toBe(finalToolWidth);
    });

    it('should call changeFillStyle of polygoneService', () => {
        component.changeFillStyle(finalToolWidth);
        expect(polygoneServiceSpy.changeFillStyle).toHaveBeenCalled();
    });

    it('should call changeSides and change the sides', () => {
        component.numberOfSides = initialsides;
        component.changeNumberOfSides(finalsides);
        expect(component.numberOfSides).toBe(finalsides);
    });
});
