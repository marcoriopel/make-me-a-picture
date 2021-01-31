import { Component } from '@angular/core';
import { CircleSelectionService } from '@app/services/tools/selection-services/circle-selection.service';

@Component({
    selector: 'app-circle-selection-attributes',
    templateUrl: './circle-selection-attributes.component.html',
    styleUrls: ['./circle-selection-attributes.component.scss'],
})
export class CircleSelectionAttributesComponent {
    constructor(public circleSelectionService: CircleSelectionService) {}
}
