import { Component } from '@angular/core';
import { SquareSelectionService } from '@app/services/tools/selection-services/square-selection.service';

@Component({
    selector: 'app-square-selection-attributes',
    templateUrl: './square-selection-attributes.component.html',
    styleUrls: ['./square-selection-attributes.component.scss'],
})
export class SquareSelectionAttributesComponent {
    constructor(public squareSelectionService: SquareSelectionService) {}
}
