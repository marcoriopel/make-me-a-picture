import { Component } from '@angular/core';
import { ToolNames, TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ToolSelectionService } from '@app/services/tool-selection/tool-selection.service';

@Component({
    selector: 'app-attribute-panel',
    templateUrl: './attribute-panel.component.html',
    styleUrls: ['./attribute-panel.component.scss'],
})
export class AttributePanelComponent {
    toolNames: ToolNames = TOOL_NAMES;
    constructor(public toolSelectionService: ToolSelectionService) {}
}
