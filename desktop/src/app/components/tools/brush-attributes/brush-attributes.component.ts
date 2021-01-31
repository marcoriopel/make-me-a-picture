import { Component } from '@angular/core';
import { PatternNames, PATTERN_NAMES } from '@app/ressources/global-variables/brush-pattern-names';
import { BrushService } from '@app/services/tools/brush.service';

@Component({
    selector: 'app-brush-attributes',
    templateUrl: './brush-attributes.component.html',
    styleUrls: ['./brush-attributes.component.scss'],
})
export class BrushAttributesComponent {
    toolWidth: number;
    patternNames: PatternNames = PATTERN_NAMES;

    constructor(public brushService: BrushService) {
        this.toolWidth = brushService.width;
        this.brushService.setPattern(this.patternNames.FIRST_PATTERN);
    }

    changeWidth(newWidth: number): void {
        this.toolWidth = newWidth;
        this.brushService.changeWidth(this.toolWidth);
    }
    setPattern(pattern: string): void {
        this.brushService.setPattern(pattern);
    }
}
