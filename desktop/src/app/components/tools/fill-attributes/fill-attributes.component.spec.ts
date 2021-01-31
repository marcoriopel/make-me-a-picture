import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FillService } from '@app/services/tools/fill.service';
import { FillAttributesComponent } from './fill-attributes.component';

// tslint:disable: no-magic-numbers
describe('FillAttributesComponent', () => {
    let component: FillAttributesComponent;
    let fixture: ComponentFixture<FillAttributesComponent>;
    let fillServiceSpy: jasmine.SpyObj<FillService>;

    beforeEach(async(() => {
        fillServiceSpy = jasmine.createSpyObj('FillService', ['changeTolerance']);
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [FillAttributesComponent],
            providers: [{ provide: FillService, useValue: fillServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FillAttributesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change tolerance', () => {
        component.tolerance = 1;
        component.changeTolerance(5);
        expect(fillServiceSpy.changeTolerance).toHaveBeenCalled();
        expect(component.tolerance).toEqual(5);
    });
});
