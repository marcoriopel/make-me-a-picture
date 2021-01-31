import { Component, Input } from '@angular/core';
import { AlignmentNames, ALIGNMENT_NAMES } from '@app/ressources/global-variables/alignment-names';
import { MAGNETISM_NAME } from '@app/ressources/global-variables/global-variables';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { SelectionService } from '@app/services/tools/selection-services/selection.service';

@Component({
    selector: 'app-magnetism',
    templateUrl: './magnetism.component.html',
    styleUrls: ['./magnetism.component.scss'],
})
export class MagnetismComponent {
    @Input() service: SelectionService;
    isMagnetismEnabled: boolean = false;
    alignmentNames: AlignmentNames = ALIGNMENT_NAMES;
    currentAlignment: string = this.alignmentNames.ALIGN_TOP_LEFT_NAME;

    constructor(public hotkeyService: HotkeyService) {
        this.hotkeyService.getKey().subscribe((toolName: string) => {
            if (toolName === MAGNETISM_NAME) {
                if (this.isMagnetismEnabled) this.enableGridMagnetism(false);
                else this.enableGridMagnetism(true);
            }
        });
    }

    enableGridMagnetism(isChecked: boolean): void {
        this.isMagnetismEnabled = isChecked;
        this.service.enableMagnetism(isChecked);
    }

    onAlignmentChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        if (target.value != undefined) {
            this.currentAlignment = target.value;
            this.service.setMagnetismAlignment(this.currentAlignment);
        }
    }
}
