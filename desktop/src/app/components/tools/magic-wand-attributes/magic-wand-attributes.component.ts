import { Component } from '@angular/core';
import { AlignmentNames, ALIGNMENT_NAMES } from '@app/ressources/global-variables/alignment-names';
import { MagicWandService } from '@app/services/tools/selection-services/magic-wand.service';

@Component({
    selector: 'app-magic-wand-attributes',
    templateUrl: './magic-wand-attributes.component.html',
    styleUrls: ['./magic-wand-attributes.component.scss'],
})
export class MagicWandAttributesComponent {
    isMagnetismEnabled: boolean = false;
    alignmentNames: AlignmentNames = ALIGNMENT_NAMES;
    currentAlignment: string = this.alignmentNames.ALIGN_TOP_LEFT_NAME;

    constructor(public magicWandService: MagicWandService) {}
}
