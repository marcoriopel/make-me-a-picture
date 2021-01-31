import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SprayService } from '@app/services/tools/spray.service';
import { SprayAttributesComponent } from './spray-attributes.component';

// tslint:disable: no-magic-numbers

describe('SprayAttributesComponent', () => {
    let component: SprayAttributesComponent;
    let fixture: ComponentFixture<SprayAttributesComponent>;
    let sprayServiceSpy: jasmine.SpyObj<SprayService>;

    beforeEach(async(() => {
        sprayServiceSpy = jasmine.createSpyObj('SprayService', ['changeWidth', 'changeDotWidth', 'changeSprayFrequency']);
        sprayServiceSpy.width = 5;
        sprayServiceSpy.dotWidth = 10;
        sprayServiceSpy.sprayFrequency = 15;

        TestBed.configureTestingModule({
            providers: [{ provide: SprayService, useValue: sprayServiceSpy }],
            declarations: [SprayAttributesComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SprayAttributesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('constructor should set right attributes', () => {
        expect(component.toolWidth).toEqual(5);
        expect(component.dotWidth).toEqual(10);
        expect(component.sprayFrequency).toEqual(15);
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

        expect(component.sprayService.changeWidth).toHaveBeenCalledWith(newWidth);
    });

    it('changeDotWidth should set dotWidth', () => {
        component.dotWidth = 0;
        const newWidth = 15;

        component.changeDotWidth(newWidth);

        expect(component.dotWidth).toEqual(newWidth);
    });

    it('changeDotWidth should call penService.changeWidth', () => {
        const newWidth = 15;

        component.changeDotWidth(newWidth);

        expect(component.sprayService.changeDotWidth).toHaveBeenCalledWith(newWidth);
    });

    it('changeSprayFrequency should set sprayFrequency', () => {
        component.sprayFrequency = 0;
        const newSprayFrequency = 15;

        component.changeSprayFrequency(newSprayFrequency);

        expect(component.sprayFrequency).toEqual(newSprayFrequency);
    });

    it('changeSprayFrequency should call penService.changeSprayFrequency', () => {
        const newSprayFrequency = 15;

        component.changeSprayFrequency(newSprayFrequency);

        expect(component.sprayService.changeSprayFrequency).toHaveBeenCalledWith(newSprayFrequency);
    });
});
