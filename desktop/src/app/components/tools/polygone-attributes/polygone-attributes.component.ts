import { Component } from '@angular/core';
import { PolygoneService } from '@app/services/tools/polygone.service';

@Component({
    selector: 'app-polygone-attributes',
    templateUrl: './polygone-attributes.component.html',
    styleUrls: ['./polygone-attributes.component.scss'],
})
export class PolygoneAttributesComponent {
    toolWidth: number;
    fillStyle: number;
    numberOfSides: number;

    constructor(public polygoneService: PolygoneService) {
        this.toolWidth = polygoneService.width;
        this.fillStyle = polygoneService.fillStyle;
        this.numberOfSides = polygoneService.sides;
    }

    changeBorderWidth(newWidth: number): void {
        this.toolWidth = newWidth;
        this.polygoneService.changeWidth(newWidth);
    }

    changeFillStyle(newFillStyle: number): void {
        this.polygoneService.changeFillStyle(newFillStyle);
    }

    changeNumberOfSides(sides: number): void {
        this.numberOfSides = sides;
        this.polygoneService.changeSides(sides);
    }
}
