import { Component } from '@angular/core';
import { CircleService } from '@app/services/tools/circle.service';

@Component({
    selector: 'app-circle-attributes',
    templateUrl: './circle-attributes.component.html',
    styleUrls: ['./circle-attributes.component.scss'],
})
export class CircleAttributesComponent {
    toolWidth: number;
    fillStyle: number;

    constructor(public circleService: CircleService) {
        this.toolWidth = circleService.width;
        this.fillStyle = circleService.fillStyle;
    }

    changeBorderWidth(newWidth: number): void {
        this.toolWidth = newWidth;
        this.circleService.changeWidth(newWidth);
    }

    changeFillStyle(newFillStyle: number): void {
        this.circleService.changeFillStyle(newFillStyle);
    }
}
