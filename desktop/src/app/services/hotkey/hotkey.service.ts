import { Injectable } from '@angular/core';
import { MAGNETISM_NAME } from '@app/ressources/global-variables/global-variables';
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
        ['p', this.toolNames.PEN_TOOL_NAME],
        ['w', this.toolNames.BRUSH_TOOL_NAME],
        ['a', this.toolNames.SPRAY_TOOL_NAME],
        ['1', this.toolNames.SQUARE_TOOL_NAME],
        ['2', this.toolNames.CIRCLE_TOOL_NAME],
        ['l', this.toolNames.LINE_TOOL_NAME],
        ['3', this.toolNames.POLYGONE_TOOL_NAME],
        ['b', this.toolNames.FILL_TOOL_NAME],
        ['e', this.toolNames.ERASER_TOOL_NAME],
        ['r', this.toolNames.SQUARE_SELECTION_TOOL_NAME],
        ['s', this.toolNames.CIRCLE_SELECTION_TOOL_NAME],
        ['i', this.toolNames.PIPETTE_TOOL_NAME],
        ['t', this.toolNames.TEXT_TOOL_NAME],
        ['d', this.toolNames.STAMP_TOOL_NAME],
        ['v', this.toolNames.MAGIC_WAND_TOOL_NAME],
        ['-', GRID_DECREASE_NAME],
        ['+', GRID_INCREASE_NAME],
        ['g', GRID_NAME],
        ['m', MAGNETISM_NAME],
    ]);
    keysNeedCtrl: Map<string, string> = new Map([
        ['o', this.sidebarElements.NEW_DRAWING_NAME],
        ['g', this.sidebarElements.CAROUSEL_NAME],
        ['s', this.sidebarElements.SAVE_SERVER_NAME],
        ['e', this.sidebarElements.EXPORT_DRAWING_NAME],
        ['a', this.sidebarElements.SELECT_ALL],
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
