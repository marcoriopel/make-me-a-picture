/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
import { HotkeyService } from './hotkey.service';

describe('Service: Hotkey', () => {
    let keyboardEvent: KeyboardEvent;
    let service: HotkeyService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [HotkeyService],
        });
        service = TestBed.inject(HotkeyService);
    });

    it('should ...', inject([HotkeyService], (hotkeyservice: HotkeyService) => {
        expect(hotkeyservice).toBeTruthy();
    }));

    it('should change toolName on a keyboard event of one of the shortcut keys without ctrl', () => {
        keyboardEvent = new KeyboardEvent('keydown', { key: 'Z', ctrlKey: true, shiftKey: true });
        const eventSpy = spyOn(service.toolName, 'next');
        service.onKeyDown(keyboardEvent);
        expect(eventSpy).toHaveBeenCalled();
    });

    it('should change toolName on a keyboard event of one of the shortcut keys with ctrl and shift', () => {
        keyboardEvent = new KeyboardEvent('keydown', { key: 'w' });
        const eventSpy = spyOn(service.toolName, 'next');
        service.onKeyDown(keyboardEvent);
        expect(eventSpy).toHaveBeenCalled();
    });

    it('should change toolName on a keyboard event of one of the shortcut keys with ctrl', () => {
        keyboardEvent = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
        const eventSpy = spyOn(service.toolName, 'next');
        service.onKeyDown(keyboardEvent);
        expect(eventSpy).toHaveBeenCalled();
    });

    it('should  not change toolName on a keyboard event of one of the shortcut keys if service is disabled', () => {
        service.isHotkeyEnabled = false;
        keyboardEvent = new KeyboardEvent('keydown', { key: 'w' });
        const eventSpy = spyOn(service.toolName, 'next');
        service.onKeyDown(keyboardEvent);
        expect(eventSpy).not.toHaveBeenCalled();
    });

    it('should  not change toolName on a keyboard event if the key is not part of the shortcut keys', () => {
        keyboardEvent = new KeyboardEvent('keydown', { key: '.' });
        const eventSpy = spyOn(service.toolName, 'next');
        service.onKeyDown(keyboardEvent);
        expect(eventSpy).not.toHaveBeenCalled();
    });

    it('should not change toolName on a keyboard event of one of the shortcut keys with ctrl if ctrl is not pressed', () => {
        keyboardEvent = new KeyboardEvent('keydown', { key: 'o', ctrlKey: false });
        const eventSpy = spyOn(service.toolName, 'next');
        service.onKeyDown(keyboardEvent);
        expect(eventSpy).not.toHaveBeenCalled();
    });
});
