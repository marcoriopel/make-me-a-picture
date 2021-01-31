import { TestBed } from '@angular/core/testing';
import { ColorSelectionService } from './color-selection.service';

describe('ColorSelectionService', () => {
    let service: ColorSelectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ColorSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return rgba color', () => {
        service.primaryColor = 'rgba(147,75,75,1)';
        const rgbaValue = {
            RED: 147,
            GREEN: 75,
            BLUE: 75,
            ALPHA: 255,
        };
        const result = service.getRgbaPrimaryColor();
        expect(result).toEqual(rgbaValue);
        expect(service).toBeTruthy();
    });
});
