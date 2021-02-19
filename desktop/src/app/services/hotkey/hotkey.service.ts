import { Injectable } from '@angular/core';
import { GRID_DECREASE_NAME, GRID_INCREASE_NAME, GRID_NAME } from '@app/ressources/global-variables/grid-elements';
import { SidebarElements, SIDEBAR_ELEMENTS } from '@app/ressources/global-variables/sidebar-elements';
import { ToolNames, TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { Observable, Subject } from 'rxjs';

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
        ['c', this.toolNames.PENCIL_TOOL_NAME],
        ['e', this.toolNames.ERASER_TOOL_NAME],
        ['-', GRID_DECREASE_NAME],
        ['+', GRID_INCREASE_NAME],
        ['g', GRID_NAME],
    ]);
    keysNeedCtrl: Map<string, string> = new Map([
        ['z', this.sidebarElements.UNDO],
    ]);
    keysNeedShift: Map<string, string> = new Map([['Z', this.sidebarElements.REDO]]);

    onKeyDown(event: KeyboardEvent): void {
        if (!this.isHotkeyEnabled) return;
        if (event.shiftKey || event.ctrlKey) event.preventDefault();
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
        }
    }
    getKey(): Observable<string> {
        return this.toolName.asObservable();
    }
}
