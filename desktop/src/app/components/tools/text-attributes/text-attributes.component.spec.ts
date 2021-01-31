import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TextService } from '@app/services/tools/text.service';
import { TextComponent } from './text-attributes.component';

// tslint:disable: no-magic-numbers
describe('TexteComponent', () => {
    let component: TextComponent;
    let fixture: ComponentFixture<TextComponent>;
    let textServiceSpy: jasmine.SpyObj<TextService>;
    beforeEach(async(() => {
        textServiceSpy = jasmine.createSpyObj('TextService', ['applyTextStyle', 'createText', 'onKeyDown']);
        TestBed.configureTestingModule({
            declarations: [TextComponent],
            imports: [MatButtonToggleModule],
            providers: [{ provide: TextService, useValue: textServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TextComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('changeFont should change font and call applyTextStyle', () => {
        component.changeFont('Arial');
        expect(textServiceSpy.applyTextStyle).toHaveBeenCalledWith();
        expect(textServiceSpy.font).toEqual('Arial');
    });

    it('changeSize should change size and call applyTextStyle', () => {
        component.changeSize(45);
        expect(textServiceSpy.applyTextStyle).toHaveBeenCalledWith();
        expect(textServiceSpy.textSize).toEqual(45);
    });

    it('changeItalic should change style to italic when true and call applyTextStyle', () => {
        component.changeItalic(true);
        expect(textServiceSpy.applyTextStyle).toHaveBeenCalledWith();
        expect(textServiceSpy.italicText).toEqual('italic');
    });

    it('changeItalic should change style to normal when false and call applyTextStyle', () => {
        component.changeItalic(false);
        expect(textServiceSpy.applyTextStyle).toHaveBeenCalledWith();
        expect(textServiceSpy.italicText).toEqual('normal');
    });

    it('changeBoldText should change boldText to normal when false and call applyTextStyle', () => {
        component.changeBoldText(false);
        expect(textServiceSpy.applyTextStyle).toHaveBeenCalledWith();
        expect(textServiceSpy.boldText).toEqual('normal');
    });

    it('changeBoldText should change boldText to bold when true and call applyTextStyle', () => {
        component.changeBoldText(true);
        expect(textServiceSpy.applyTextStyle).toHaveBeenCalledWith();
        expect(textServiceSpy.boldText).toEqual('bold');
    });

    it('changeAlignment should change align and call applyTextStyle', () => {
        component.changeAlignment('center');
        expect(textServiceSpy.applyTextStyle).toHaveBeenCalledWith();
        expect(textServiceSpy.align).toEqual('center');
    });

    it('changeAlignment should change align and call applyTextStyle', () => {
        component.changeAlignment('center');
        expect(textServiceSpy.applyTextStyle).toHaveBeenCalledWith();
        expect(textServiceSpy.align).toEqual('center');
    });
});
