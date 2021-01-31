import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CircleSelectionService } from '@app/services/tools/selection-services/circle-selection.service';
import { CircleSelectionAttributesComponent } from './circle-selection-attributes.component';

describe('CircleSelectionAttributesComponent', () => {
    let component: CircleSelectionAttributesComponent;
    let fixture: ComponentFixture<CircleSelectionAttributesComponent>;
    let circleSelectionServiceSpy: jasmine.SpyObj<CircleSelectionService>;

    beforeEach(async(() => {
        circleSelectionServiceSpy = jasmine.createSpyObj('CircleSelectionService', ['enableMagnetism', 'setMagnetismAlignment']);

        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [CircleSelectionAttributesComponent],
            providers: [{ provide: CircleSelectionService, useValue: circleSelectionServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CircleSelectionAttributesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
