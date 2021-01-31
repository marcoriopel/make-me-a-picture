import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PenService } from '@app/services/tools/pen.service';
import { Subject } from 'rxjs';
import { PenAttributesComponent } from './pen-attributes.component';

describe('PenAttributesComponent', () => {
    let component: PenAttributesComponent;
    let fixture: ComponentFixture<PenAttributesComponent>;
    let penServiceSpy: jasmine.SpyObj<PenService>;
    let obs: Subject<number>;

    beforeEach(async(() => {
        obs = new Subject<number>();
        penServiceSpy = jasmine.createSpyObj('PenService', ['changeWidth', 'changeAngle', 'getAngle']);
        penServiceSpy.getAngle.and.returnValue(obs.asObservable());

        TestBed.configureTestingModule({
            providers: [{ provide: PenService, useValue: penServiceSpy }],
            declarations: [PenAttributesComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PenAttributesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change angle on penservice.angle changes', () => {
        component.angle = 0;
        const newAngle = 30;

        obs.next(newAngle);

        expect(component.angle).toEqual(newAngle);
    });

    it('changeWidth should set toolwidth', () => {
        component.toolWidth = 0;
        const newWidth = 15;

        component.changeWidth(newWidth);

        expect(component.toolWidth).toEqual(newWidth);
    });

    it('changeWidth should call penService.changeWidth', () => {
        const newWidth = 15;

        component.changeWidth(newWidth);

        expect(component.penService.changeWidth).toHaveBeenCalledWith(newWidth);
    });

    it('changeAngle should set angle', () => {
        component.angle = 0;
        const newAngle = 15;

        component.changeAngle(newAngle);

        expect(component.angle).toEqual(newAngle);
    });

    it('changeAngle should call penService.changeAngle', () => {
        const newAngle = 15;

        component.changeAngle(newAngle);

        expect(component.penService.changeAngle).toHaveBeenCalledWith(newAngle);
    });
});
