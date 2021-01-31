/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MagicWandService } from '@app/services/tools/selection-services/magic-wand.service';
import { MagicWandAttributesComponent } from './magic-wand-attributes.component';

describe('MagicWandAttributesComponent', () => {
    let component: MagicWandAttributesComponent;
    let fixture: ComponentFixture<MagicWandAttributesComponent>;
    let magicWandServiceSpy: jasmine.SpyObj<MagicWandService>;

    beforeEach(async(() => {
        magicWandServiceSpy = jasmine.createSpyObj('MagicWandService', ['enableMagnetism', 'setMagnetismAlignment']);

        TestBed.configureTestingModule({
            declarations: [MagicWandAttributesComponent],
            providers: [{ provide: MagicWandService, useValue: magicWandServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MagicWandAttributesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
