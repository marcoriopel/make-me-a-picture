import { Injectable } from '@angular/core';
import { SidebarElements, SIDEBAR_ELEMENTS } from '@app/ressources/global-variables/sidebar-elements';
import { ToolNames, TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { Observable, Subject } from 'rxjs';
import { UndoRedoService } from '../undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class HotkeyService {
    toolName: Subject<string> = new Subject<string>();
    eventKey: Subject<KeyboardEvent> = new Subject<KeyboardEvent>();
    toolNames: ToolNames = TOOL_NAMES;
    sidebarElements: SidebarElements = SIDEBAR_ELEMENTS;
    isHotkeyEnabled: boolean = true;

    keyMapping: Map<string, string> = new Map([
    ]);
    keysNeedCtrl: Map<string, string> = new Map([
        ['z', this.sidebarElements.UNDO],
    ]);
    keysNeedShift: Map<string, string> = new Map([['Z', this.sidebarElements.REDO]]);

    constructor(private undoRedoService: UndoRedoService){}

    onKeyDown(event: KeyboardEvent): void {
        if (!this.isHotkeyEnabled) return;
        let keyName: string | undefined;
        if (event.shiftKey && event.ctrlKey) {
            keyName = this.keysNeedShift.get(event.key.toString());
        } else if (event.ctrlKey) {
            keyName = this.keysNeedCtrl.get(event.key.toString());
        } else {
            keyName = this.keyMapping.get(event.key.toString());
        }
        if (keyName) {
            this.toolName.next(keyName);
            this.callMethod(keyName);
        }
    }

    callMethod(keyName: string): void {
        if(keyName == 'Annuler'){
            this.undoRedoService.undo();
        } else if (keyName == 'Refaire') {
            this.undoRedoService.redo();
        }
    }

    getKey(): Observable<string> {
        return this.toolName.asObservable();
    }
}
