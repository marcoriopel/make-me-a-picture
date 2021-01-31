import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PipetteAttributesComponent } from './pipette-attributes.component';

describe('PipetteAttributesComponent', () => {
    let component: PipetteAttributesComponent;
    let fixture: ComponentFixture<PipetteAttributesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PipetteAttributesComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PipetteAttributesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should make the canvas visible when it enter the canvas', () => {
        component.pipetteService.onMouseEnter();

        expect(component.zoom.nativeElement.style.visibility).toEqual('visible');
    });

    it('should make the canvas invisible when it leave the canvas', () => {
        component.pipetteService.onMouseLeave();

        expect(component.zoom.nativeElement.style.visibility).toEqual('hidden');
    });
});
