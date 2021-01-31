import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SquareSelectionService } from '@app/services/tools/selection-services/square-selection.service';
import { SquareSelectionAttributesComponent } from './square-selection-attributes.component';

describe('SqareSelectionAttributesComponent', () => {
    let component: SquareSelectionAttributesComponent;
    let fixture: ComponentFixture<SquareSelectionAttributesComponent>;
    let squareSelectionServiceSpy: jasmine.SpyObj<SquareSelectionService>;

    beforeEach(async(() => {
        squareSelectionServiceSpy = jasmine.createSpyObj('SquareSelectionService', ['enableMagnetism', 'setMagnetismAlignment']);

        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [SquareSelectionAttributesComponent],
            providers: [{ provide: SquareSelectionService, useValue: squareSelectionServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SquareSelectionAttributesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
