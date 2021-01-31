import { Component } from '@angular/core';
import { LineService } from '@app/services/tools/line.service';

@Component({
    selector: 'app-line-attributes',
    templateUrl: './line-attributes.component.html',
    styleUrls: ['./line-attributes.component.scss'],
})
export class LineAttributesComponent {
    toolWidth: number;
    dotWith: number;
    isDot: boolean;

    constructor(public lineService: LineService) {
        this.toolWidth = lineService.lineWidth;
        this.dotWith = lineService.dotWidth;
        this.isDot = lineService.isDot;
    }

    changeDotWidth(newWidth: number): void {
        this.dotWith = newWidth;
        this.lineService.changeDotWidth(newWidth);
    }

    changeLineWidth(newWidth: number): void {
        this.toolWidth = newWidth;
        this.lineService.changeLineWidth(newWidth);
    }

    changeJunctionPoint(isChecked: boolean): void {
        this.lineService.changeJunction(isChecked);
    }
}
